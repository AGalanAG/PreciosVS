/**
 * Servicio de analisis de precios
 * Convierte monedas, unifica resultados y calcula estadisticas
 */

const { filtrarProductosRelevantes } = require('./relevance.filter');

// Tasa de cambio aproximada USD a MXN
const TASA_CAMBIO_USD_MXN = 19;

/**
 * Convierte un precio de USD a MXN
 * @param {string|number} precioUSD - Precio en USD
 * @returns {number} Precio en MXN
 */
function convertirUSDaMXN(precioUSD) {
  const precio = typeof precioUSD === 'string' 
    ? parseFloat(precioUSD.replace(/,/g, '')) 
    : precioUSD;
  return precio * TASA_CAMBIO_USD_MXN;
}

/**
 * Convierte un precio de MXN a USD
 * @param {string|number} precioMXN - Precio en MXN
 * @returns {number} Precio en USD
 */
function convertirMXNaUSD(precioMXN) {
  const precio = typeof precioMXN === 'string' 
    ? parseFloat(precioMXN.replace(/,/g, '')) 
    : precioMXN;
  return precio / TASA_CAMBIO_USD_MXN;
}

/**
 * Parsea un precio string a numero
 * @param {string} precioStr - Precio como string
 * @returns {number} Precio numerico
 */
function parsearPrecio(precioStr) {
  if (typeof precioStr === 'number') return precioStr;
  return parseFloat(precioStr.replace(/,/g, '')) || 0;
}

/**
 * Calcula el percentil de un array de numeros
 * @param {number[]} arr - Array de numeros ordenado
 * @param {number} percentil - Percentil a calcular (0-100)
 * @returns {number} Valor del percentil
 */
function calcularPercentil(arr, percentil) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentil / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Unifica y analiza resultados de ambas fuentes
 * @param {object} resultadosML - Resultados de MercadoLibre
 * @param {object} resultadosEbay - Resultados de eBay
 * @param {string} producto - Producto buscado
 * @param {object} opciones - Opciones de filtrado
 * @returns {object} Resultados unificados con analisis
 */
function analizarPrecios(resultadosML, resultadosEbay, producto, opciones = {}) {
  const {
    aplicarFiltroInteligente = true,
    filtrarAccesorios = true,
    filtrarOutliers = true,
    scoreMinimo = 40
  } = opciones;
  
  // Procesar resultados de MercadoLibre (ya en MXN)
  const productosML = (resultadosML.resultados || []).map(item => {
    const precioMXN = parsearPrecio(item.precio);
    return {
      ...item,
      fuente: 'MercadoLibre',
      precioOriginal: item.precio,
      monedaOriginal: 'MXN',
      precioMXN: precioMXN,
      precioUSD: parseFloat(convertirMXNaUSD(precioMXN).toFixed(2))
    };
  });

  // Procesar resultados de eBay (ya en MXN - el módulo cambia la moneda automáticamente)
  const productosEbay = (resultadosEbay.resultados || []).map(item => {
    const precioMXN = parsearPrecio(item.precio);
    return {
      ...item,
      fuente: 'eBay',
      precioOriginal: item.precio,
      monedaOriginal: 'MXN',
      precioMXN: precioMXN,
      precioUSD: parseFloat(convertirMXNaUSD(precioMXN).toFixed(2))
    };
  });

  // Combinar todos los productos
  const todosProductos = [...productosML, ...productosEbay];
  
  // Aplicar filtrado inteligente si está habilitado
  let productosRelevantes = todosProductos;
  let productosExcluidos = [];
  let estadisticasFiltrado = null;
  
  if (aplicarFiltroInteligente) {
    const resultado = filtrarProductosRelevantes(todosProductos, producto, {
      filtrarAccesorios,
      filtrarOutliers,
      scoreMinimo,
      preservarCoincidenciasExactas: true
    });
    
    productosRelevantes = resultado.productosRelevantes;
    productosExcluidos = resultado.productosExcluidos;
    estadisticasFiltrado = resultado.estadisticas;
  }
  
  // Filtrar solo productos con coincidencia exacta para el análisis de precios
  const productosConCoincidencia = productosRelevantes.filter(p => p.coincidenciaExacta === true);
  const preciosConCoincidencia = productosConCoincidencia.map(p => p.precioMXN).filter(p => p > 0);
  
  // Calcular estadisticas solo con productos que tienen coincidencia exacta
  const preciosOrdenados = preciosConCoincidencia.sort((a, b) => a - b);
  
  let analisis = {
    precioMinimo: null,
    precioMaximo: null,
    precioPromedio: null,
    precioSugerido: null,
    percentil25: null,
    totalProductos: preciosOrdenados.length,
    productosAnalizados: preciosOrdenados.length,
    productosTotal: todosProductos.length,
    productosRelevantes: productosRelevantes.length,
    productosExcluidos: productosExcluidos.length,
    mensaje: null,
    filtrado: estadisticasFiltrado
  };

  if (preciosOrdenados.length > 0) {
    const precioMin = preciosOrdenados[0];
    const precioMax = preciosOrdenados[preciosOrdenados.length - 1];
    const precioPromedio = preciosOrdenados.reduce((a, b) => a + b, 0) / preciosOrdenados.length;
    const percentil25 = calcularPercentil(preciosOrdenados, 25);

    // Encontrar el producto con precio minimo y maximo (solo entre los de coincidencia exacta)
    const productoMin = productosConCoincidencia.find(p => p.precioMXN === precioMin);
    const productoMax = productosConCoincidencia.find(p => p.precioMXN === precioMax);

    analisis = {
      precioMinimo: {
        valor: parseFloat(precioMin.toFixed(2)),
        valorUSD: parseFloat((precioMin / TASA_CAMBIO_USD_MXN).toFixed(2)),
        fuente: productoMin?.fuente || 'Desconocido',
        titulo: productoMin?.titulo || 'N/A'
      },
      precioMaximo: {
        valor: parseFloat(precioMax.toFixed(2)),
        valorUSD: parseFloat((precioMax / TASA_CAMBIO_USD_MXN).toFixed(2)),
        fuente: productoMax?.fuente || 'Desconocido',
        titulo: productoMax?.titulo || 'N/A'
      },
      precioPromedio: {
        valor: parseFloat(precioPromedio.toFixed(2)),
        valorUSD: parseFloat((precioPromedio / TASA_CAMBIO_USD_MXN).toFixed(2))
      },
      precioSugerido: {
        valor: parseFloat(percentil25.toFixed(2)),
        valorUSD: parseFloat((percentil25 / TASA_CAMBIO_USD_MXN).toFixed(2)),
        metodo: 'percentil25'
      },
      percentil25: parseFloat(percentil25.toFixed(2)),
      totalProductos: todosProductos.length,
      productosAnalizados: preciosOrdenados.length,
      productosRelevantes: productosRelevantes.length,
      productosExcluidos: productosExcluidos.length,
      mensaje: aplicarFiltroInteligente 
        ? `Precio basado en ${preciosOrdenados.length} productos relevantes con coincidencia exacta (${productosExcluidos.length} productos excluidos por baja relevancia). Percentil 25: más bajo que el 75%`
        : `Precio basado en ${preciosOrdenados.length} productos con coincidencia exacta (Percentil 25: mas bajo que el 75%)`,
      filtrado: estadisticasFiltrado
    };
  }

  return {
    exito: true,
    producto: producto,
    moneda: {
      principal: 'MXN',
      tasaCambio: {
        usdToMxn: TASA_CAMBIO_USD_MXN,
        aproximado: true,
        nota: 'Tasa de cambio aproximada. El valor real puede variar.'
      }
    },
    analisis: analisis,
    resultados: {
      mercadolibre: {
        exito: resultadosML.exito,
        total: productosML.length,
        relevantes: productosRelevantes.filter(p => p.fuente === 'MercadoLibre').length,
        coincidenciasExactas: productosRelevantes.filter(p => p.fuente === 'MercadoLibre' && p.coincidenciaExacta).length,
        coincidenciasParciales: productosRelevantes.filter(p => p.fuente === 'MercadoLibre' && !p.coincidenciaExacta).length,
        productos: productosRelevantes.filter(p => p.fuente === 'MercadoLibre')
      },
      ebay: {
        exito: resultadosEbay.exito,
        total: productosEbay.length,
        relevantes: productosRelevantes.filter(p => p.fuente === 'eBay').length,
        coincidenciasExactas: productosRelevantes.filter(p => p.fuente === 'eBay' && p.coincidenciaExacta).length,
        coincidenciasParciales: productosRelevantes.filter(p => p.fuente === 'eBay' && !p.coincidenciaExacta).length,
        productos: productosRelevantes.filter(p => p.fuente === 'eBay')
      }
    },
    productosExcluidos: aplicarFiltroInteligente ? productosExcluidos : [],
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  TASA_CAMBIO_USD_MXN,
  convertirUSDaMXN,
  convertirMXNaUSD,
  parsearPrecio,
  calcularPercentil,
  analizarPrecios
};
