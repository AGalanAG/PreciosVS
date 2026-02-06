const puppeteer = require('puppeteer');

/**
 * Función principal para buscar productos en eBay.com
 * @param {string} producto - Nombre del producto a buscar
 * @returns {Promise<Array>} Array con los primeros 15 resultados encontrados
 */
async function buscarProducto(producto) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Configurar User-Agent para parecer un navegador real
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Ocultar que estamos usando Puppeteer
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
    
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(producto)}`;
    
    try {
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });
    } catch (navError) {
      // Si falla la navegación, intentar continuar de todas formas
      console.error('Advertencia navegación:', navError.message);
    }

    // Esperar con timeout más flexible
    try {
      await page.waitForSelector('ul.srp-results li, div.srp-river-results, .s-item', { 
        timeout: 20000 
      });
    } catch (waitError) {
      // Verificar si hay elementos de todas formas
      const elementosExisten = await page.evaluate(() => {
        const items1 = document.querySelectorAll('ul.srp-results li').length;
        const items2 = document.querySelectorAll('div.srp-river-results .s-item').length;
        const items3 = document.querySelectorAll('.s-item').length;
        return items1 > 0 || items2 > 0 || items3 > 0;
      });
      
      if (!elementosExisten) {
        throw new Error('No se encontraron resultados de búsqueda. Posible bloqueo o problema de red.');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const precios = await page.evaluate((productoBuscado) => {
      // Obtener elementos de resultados
      let elementos = Array.from(document.querySelectorAll('ul.srp-results > li'));
      
      // Filtrar elementos que no tengan contenido real (primeros pueden ser ads o promotions)
      elementos = elementos.filter(el => {
        const hasCard = el.classList.contains('s-card');
        return hasCard;
      });
      
      const preciosArray = [];
      
      for (let i = 0; i < Math.min(elementos.length, 15); i++) {
        const elemento = elementos[i];
        
        // Buscar el precio - selector específico para eBay
        let precioElement = elemento.querySelector('span.s-card__price');
        let precio = '';
        
        if (precioElement) {
          precio = precioElement.textContent.trim();
        } else {
          // Fallback: buscar span con clases su-styled-text y s-card__price
          precioElement = elemento.querySelector('span.su-styled-text.s-card__price');
          if (precioElement) {
            precio = precioElement.textContent.trim();
          } else {
            // Último recurso: buscar en todos los spans que contengan precio
            const allSpans = Array.from(elemento.querySelectorAll('span'));
            const priceSpan = allSpans.find(s => {
              const text = s.textContent.trim();
              // Reconocer precios con espacios (MXN), comas (USD) o sin separador
              // Ejemplos: "$9 000.00", "$9,000.00", "$9000.00"
              return text.match(/^\$[\d\s,]+\.?\d*$/) && s.classList.contains('s-card__price');
            });
            if (priceSpan) {
              precio = priceSpan.textContent.trim();
            }
          }
        }
        
        // Buscar el precio de envío - múltiples estrategias
        let precioEnvio = 0;
        
        // Estrategia 1: Buscar en span.s-card__shipping (formato de listado)
        let envioElement = elemento.querySelector('span.s-card__shipping');
        
        // Estrategia 2: Buscar en cualquier elemento que contenga "shipping" o "envío"
        if (!envioElement) {
          const allSpans = Array.from(elemento.querySelectorAll('span'));
          envioElement = allSpans.find(s => {
            const text = s.textContent.toLowerCase();
            return (text.includes('shipping') || text.includes('envío') || text.includes('envio')) 
                   && text.match(/[\$][\d\s,]+\.?\d*/);
          });
        }
        
        // Estrategia 3: Buscar en divs con clases ux-labels-values o s-item__shipping
        if (!envioElement) {
          envioElement = elemento.querySelector('.s-item__shipping, .ux-labels-values__values-content');
        }
        
        if (envioElement) {
          const envioTexto = envioElement.textContent.trim();
          
          // Primero intentar extraer el precio en MXN si viene convertido
          // Ejemplo: "US $64.20 (aproximadamente MXN $1,123.97)"
          const matchMXN = envioTexto.match(/MXN\s*\$?\s*([\d\s,]+\.?\d*)/i);
          if (matchMXN) {
            let precioEnvioStr = matchMXN[1]
              .replace(/\s+/g, '')
              .replace(/,/g, '');
            precioEnvio = parseFloat(precioEnvioStr) || 0;
          } else {
            // Si no hay conversión a MXN, buscar el precio directamente
            // Esto aplica cuando el precio ya está en MXN desde el inicio
            const matchEnvio = envioTexto.match(/[\$][\d\s,]+\.?\d*/);
            if (matchEnvio) {
              let precioEnvioStr = matchEnvio[0]
                .replace(/\$/g, '')
                .replace(/\s+/g, '')
                .replace(/,/g, '');
              precioEnvio = parseFloat(precioEnvioStr) || 0;
            }
          }
        }
        
        if (precio) {
          // Limpiar el precio - IMPORTANTE: manejar espacios como separador de miles (formato MXN)
          // Ejemplo: "$9 000.00" o "9 000.00 MXN" debe convertirse a "9000.00"
          precio = precio.replace(/MXN\s*/gi, '').replace(/USD\s*/gi, '')
                         .replace(/\$/g, '')
                         .replace(/\s+/g, '')  // Eliminar TODOS los espacios (separador de miles en MXN)
                         .replace(/,/g, '')    // Eliminar comas (separador de miles en USD)
                         .trim();
          
          // Si hay rango de precios, tomar el primer valor
          if (precio.includes('to') || precio.includes('a ')) {
            precio = precio.split(/to|a /)[0].trim();
          }
          
          // Convertir a número y sumar el precio de envío
          const precioProducto = parseFloat(precio) || 0;
          const precioTotal = precioProducto + precioEnvio;
          
          // Convertir de vuelta a string para mantener compatibilidad con el resto del código
          precio = precioTotal.toFixed(2);
          
          // Obtener el título del producto
          let titulo = 'Sin título';
          
          // Estrategia 1: buscar en span con clase específica
          let tituloElement = elemento.querySelector('.s-card__title span.su-styled-text.primary');
          if (tituloElement) {
            titulo = tituloElement.textContent.trim();
          } else {
            // Estrategia 2: buscar en div título
            tituloElement = elemento.querySelector('.s-card__title');
            if (tituloElement) {
              titulo = tituloElement.textContent.trim();
            } else {
              // Estrategia 3: buscar cualquier span con texto largo
              const spans = Array.from(elemento.querySelectorAll('span.su-styled-text.primary'));
              const titleSpan = spans.find(s => s.textContent.length > 20);
              if (titleSpan) {
                titulo = titleSpan.textContent.trim();
              }
            }
          }
          
          // Limpiar el título
          titulo = titulo.replace(/^Anuncio nuevo:?\s*/i, '')
                         .replace(/^New Listing:?\s*/i, '')
                         .replace(/Se abre en una ventana nueva/gi, '')
                         .trim();
          
          // Saltar si es un placeholder
          if (titulo.toLowerCase().includes('shop on ebay') || titulo.length < 5) {
            continue;
          }
          
          // Obtener el link del producto
          let linkElement = elemento.querySelector('a.s-card__link, a[href*="ebay.com/itm"]');
          const link = linkElement ? linkElement.href : '';
          
          preciosArray.push({
            posicion: preciosArray.length + 1,
            titulo: titulo,
            precio: precio,
            precioProducto: precioProducto.toFixed(2),
            precioEnvio: precioEnvio.toFixed(2),
            link: link
          });
        }
      }
      
      // Clasificar: primero los que tienen la palabra exacta, luego el resto
      const palabrasBuscadas = productoBuscado.toLowerCase().split(/\s+/);
      
      const conCoincidenciaExacta = preciosArray.filter(item => {
        const tituloLower = item.titulo.toLowerCase();
        return palabrasBuscadas.every(palabra => {
          // Buscar la palabra completa usando word boundary
          const regex = new RegExp(`\\b${palabra}\\b`, 'i');
          return regex.test(tituloLower);
        });
      });
      
      const sinCoincidenciaExacta = preciosArray.filter(item => {
        const tituloLower = item.titulo.toLowerCase();
        return !palabrasBuscadas.every(palabra => {
          const regex = new RegExp(`\\b${palabra}\\b`, 'i');
          return regex.test(tituloLower);
        });
      });
      
      // Reordenar posiciones
      const resultadosOrdenados = [...conCoincidenciaExacta, ...sinCoincidenciaExacta];
      resultadosOrdenados.forEach((item, index) => {
        item.posicion = index + 1;
        item.coincidenciaExacta = index < conCoincidenciaExacta.length;
      });
      
      return resultadosOrdenados;
    }, producto);

    const exactas = precios.filter(p => p.coincidenciaExacta).length;
    const parciales = precios.length - exactas;

    return {
      exito: true,
      producto: producto,
      totalResultados: precios.length,
      coincidenciasExactas: exactas,
      coincidenciasParciales: parciales,
      resultados: precios
    };

  } catch (error) {
    return {
      exito: false,
      error: error.message,
      producto: producto
    };
  } finally {
    await browser.close();
  }
}

module.exports = buscarProducto;

// Permitir ejecución directa desde CLI si es necesario
if (require.main === module) {
  const productoABuscar = process.argv[2] || 'laptop';
  buscarProducto(productoABuscar)
    .then(resultado => {
      console.log(JSON.stringify(resultado, null, 2));
      process.exit(resultado.exito ? 0 : 1);
    })
    .catch(error => {
      console.error(JSON.stringify({ exito: false, error: error.message }));
      process.exit(1);
    });
}
