/**
 * Configuracion de la aplicacion Express
 */

const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', searchRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'comparador-precios-backend'
  });
});

// Ruta raiz
app.get('/', (req, res) => {
  res.json({
    nombre: 'Comparador de Precios API',
    version: '1.0.0',
    endpoints: {
      busquedaCompleta: 'GET /api/search/:producto',
      mercadoLibre: 'GET /api/mercadolibre/:producto',
      ebay: 'GET /api/ebay/:producto',
      cacheStats: 'GET /api/cache/stats',
      cacheFlush: 'DELETE /api/cache/flush',
      health: 'GET /health'
    },
    notas: {
      moneda: 'Precios unificados en MXN',
      tasaCambio: '1 USD = 19 MXN (aproximado)',
      cache: 'TTL de 5 minutos'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    exito: false,
    error: err.message
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    error: 'Ruta no encontrada'
  });
});

module.exports = app;
