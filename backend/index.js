/**
 * Punto de entrada del servidor
 * Comparador de Precios - Backend
 */

const app = require('./src/app');

const PORT = process.env.PORT || 3847;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Comparador de Precios - Backend');
  console.log('========================================');
  console.log(`  Servidor corriendo en puerto ${PORT}`);
  console.log(`  http://localhost:${PORT}`);
  console.log('');
  console.log('  Endpoints disponibles:');
  console.log(`  - GET /api/search/:producto`);
  console.log(`  - GET /api/mercadolibre/:producto`);
  console.log(`  - GET /api/ebay/:producto`);
  console.log(`  - GET /api/cache/stats`);
  console.log('========================================');
});
