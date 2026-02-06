#!/usr/bin/env node

/**
 * Script de prueba para el filtrado inteligente
 * Demuestra cómo el sistema excluye accesorios y productos irrelevantes
 */

const http = require('http');

// Configuración
const API_URL = 'http://localhost:3847';

/**
 * Realiza una petición HTTP GET
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Prueba una búsqueda
 */
async function probarBusqueda(producto, opciones = {}) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 BUSCANDO: "${producto}"`);
  console.log('='.repeat(80));
  
  // Construir URL con opciones
  let url = `${API_URL}/api/search/${encodeURIComponent(producto)}`;
  
  const params = new URLSearchParams();
  if (opciones.filtroInteligente !== undefined) {
    params.append('filtroInteligente', opciones.filtroInteligente);
  }
  if (opciones.filtrarAccesorios !== undefined) {
    params.append('filtrarAccesorios', opciones.filtrarAccesorios);
  }
  if (opciones.filtrarOutliers !== undefined) {
    params.append('filtrarOutliers', opciones.filtrarOutliers);
  }
  if (opciones.scoreMinimo !== undefined) {
    params.append('scoreMinimo', opciones.scoreMinimo);
  }
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  console.log(`📡 URL: ${url}`);
  console.log('');
  
  try {
    const inicio = Date.now();
    const resultado = await httpGet(url);
    const tiempo = Date.now() - inicio;
    
    if (!resultado.exito) {
      console.log('❌ Error:', resultado.error);
      return;
    }
    
    // Mostrar estadísticas de filtrado
    const analisis = resultado.analisis;
    
    console.log('📊 ESTADÍSTICAS DE FILTRADO:');
    console.log('─'.repeat(80));
    
    if (analisis.filtrado) {
      const f = analisis.filtrado;
      console.log(`Total productos encontrados:  ${f.totalOriginal}`);
      console.log(`Productos relevantes:         ${f.totalRelevantes} (${((f.totalRelevantes/f.totalOriginal)*100).toFixed(1)}%)`);
      console.log(`Productos excluidos:          ${f.totalExcluidos} (${((f.totalExcluidos/f.totalOriginal)*100).toFixed(1)}%)`);
      console.log('');
      console.log('Razones de exclusión:');
      console.log(`  • Por accesorios:           ${f.excluidos.porAccesorios}`);
      console.log(`  • Por score bajo:           ${f.excluidos.porScoreBajo}`);
      console.log(`  • Por precio outlier:       ${f.excluidos.porOutliers}`);
      console.log('');
      console.log(`Score promedio relevancia:    ${f.scorePromedio.toFixed(1)}/100`);
      console.log(`Umbral precio mínimo:         $${f.umbralPrecio.umbralMinimo.toFixed(2)} MXN`);
      console.log(`Umbral precio máximo:         $${f.umbralPrecio.umbralMaximo.toFixed(2)} MXN`);
    } else {
      console.log('Filtrado inteligente desactivado');
      console.log(`Total productos:              ${analisis.productosTotal}`);
    }
    
    console.log('');
    console.log('💰 ANÁLISIS DE PRECIOS:');
    console.log('─'.repeat(80));
    
    if (analisis.precioMinimo) {
      console.log(`Precio mínimo:    $${analisis.precioMinimo.valor} MXN (${analisis.precioMinimo.fuente})`);
      console.log(`Precio máximo:    $${analisis.precioMaximo.valor} MXN (${analisis.precioMaximo.fuente})`);
      console.log(`Precio promedio:  $${analisis.precioPromedio.valor} MXN`);
      console.log(`Precio sugerido:  $${analisis.precioSugerido.valor} MXN (Percentil 25)`);
      console.log('');
      console.log(`📝 ${analisis.mensaje}`);
    } else {
      console.log('No hay suficientes datos para análisis de precios');
    }
    
    // Mostrar productos relevantes (top 5)
    const todosRelevantes = [
      ...resultado.resultados.mercadolibre.productos,
      ...resultado.resultados.ebay.productos
    ].sort((a, b) => (b.scoreRelevancia || 0) - (a.scoreRelevancia || 0));
    
    if (todosRelevantes.length > 0) {
      console.log('');
      console.log('✅ TOP 5 PRODUCTOS RELEVANTES:');
      console.log('─'.repeat(80));
      
      todosRelevantes.slice(0, 5).forEach((p, i) => {
        const score = p.scoreRelevancia || 'N/A';
        const coincidencia = p.coincidenciaExacta ? '✓' : '~';
        console.log(`${i + 1}. [${coincidencia}] Score: ${score}/100 | $${p.precioMXN || p.precio} MXN | ${p.fuente}`);
        console.log(`   ${p.titulo.substring(0, 75)}${p.titulo.length > 75 ? '...' : ''}`);
      });
    }
    
    // Mostrar productos excluidos (top 5)
    if (resultado.productosExcluidos && resultado.productosExcluidos.length > 0) {
      console.log('');
      console.log('❌ TOP 5 PRODUCTOS EXCLUIDOS:');
      console.log('─'.repeat(80));
      
      resultado.productosExcluidos.slice(0, 5).forEach((p, i) => {
        const score = p.scoreRelevancia || 'N/A';
        console.log(`${i + 1}. Score: ${score}/100 | $${p.precioMXN || p.precio} MXN | ${p.fuente}`);
        console.log(`   ${p.titulo.substring(0, 70)}${p.titulo.length > 70 ? '...' : ''}`);
        console.log(`   💡 Razón: ${p.razonExclusion}`);
      });
    }
    
    console.log('');
    console.log(`⏱️  Tiempo de respuesta: ${tiempo}ms`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Error en la petición:', error.message);
  }
}

/**
 * Programa principal
 */
async function main() {
  console.log('\n');
  console.log('🤖 DEMOSTRACIÓN DEL FILTRADO INTELIGENTE');
  console.log('═'.repeat(80));
  console.log('Este script demuestra cómo el filtrado inteligente ayuda a');
  console.log('distinguir entre el producto principal y sus accesorios.');
  console.log('═'.repeat(80));
  
  // Prueba 1: Router con accesorios (filtrado activado)
  await probarBusqueda('cisco meraki mr34', {
    filtroInteligente: true,
    filtrarAccesorios: true,
    filtrarOutliers: true,
    scoreMinimo: 40
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Prueba 2: Consola con accesorios (filtrado activado)
  await probarBusqueda('playstation 5', {
    filtroInteligente: true,
    filtrarAccesorios: true,
    filtrarOutliers: true,
    scoreMinimo: 40
  });
  
  console.log('\n' + '═'.repeat(80));
  console.log('✨ FIN DE LA DEMOSTRACIÓN');
  console.log('═'.repeat(80));
  console.log('\nPara más información, consulta: docs/FILTRADO_INTELIGENTE.md\n');
}

// Ejecutar
main().catch(console.error);
