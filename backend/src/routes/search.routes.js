/**
 * Rutas de busqueda de productos
 */

const express = require('express');
const router = express.Router();

const { buscarEnMercadoLibre, buscarEnEbay } = require('../scrapers');
const { analizarPrecios } = require('../services/price.service');
const { 
  generateCacheKey, 
  getFromCache, 
  setInCache, 
  getCacheStats, 
  flushCache 
} = require('../services/cache');

/**
 * GET /api/search/:producto
 * Busca en MercadoLibre y eBay simultaneamente
 */
router.get('/search/:producto', async (req, res) => {
  try {
    const { producto } = req.params;
    
    if (!producto || producto.trim().length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar un producto a buscar'
      });
    }

    const cacheKey = generateCacheKey(producto, 'all');
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.json({
        ...cached.data,
        _cache: {
          hit: true,
          key: cacheKey,
          ttlRemaining: cached.ttlRemaining
        }
      });
    }

    console.log(`[Search] Buscando "${producto}" en MercadoLibre y eBay...`);
    
    // Ejecutar ambas busquedas en paralelo
    const [resultadosML, resultadosEbay] = await Promise.all([
      buscarEnMercadoLibre(producto),
      buscarEnEbay(producto)
    ]);

    // Analizar y unificar resultados
    const resultado = analizarPrecios(resultadosML, resultadosEbay, producto);

    // Guardar en cache si fue exitoso
    if (resultado.exito) {
      setInCache(cacheKey, resultado);
    }

    res.json({
      ...resultado,
      _cache: {
        hit: false,
        key: cacheKey,
        ttl: 300
      }
    });

  } catch (error) {
    console.error('[Search Error]', error.message);
    res.status(500).json({
      exito: false,
      error: error.message,
      producto: req.params.producto
    });
  }
});

/**
 * GET /api/mercadolibre/:producto
 * Busca solo en MercadoLibre
 */
router.get('/mercadolibre/:producto', async (req, res) => {
  try {
    const { producto } = req.params;
    
    if (!producto || producto.trim().length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar un producto a buscar'
      });
    }

    const cacheKey = generateCacheKey(producto, 'mercadolibre');
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.json({
        ...cached.data,
        _cache: { hit: true, key: cacheKey, ttlRemaining: cached.ttlRemaining }
      });
    }

    console.log(`[Search] Buscando "${producto}" en MercadoLibre...`);
    const resultado = await buscarEnMercadoLibre(producto);

    if (resultado.exito) {
      setInCache(cacheKey, resultado);
    }

    res.json({
      ...resultado,
      fuente: 'MercadoLibre',
      moneda: 'MXN',
      _cache: { hit: false, key: cacheKey, ttl: 300 }
    });

  } catch (error) {
    console.error('[MercadoLibre Error]', error.message);
    res.status(500).json({
      exito: false,
      error: error.message,
      producto: req.params.producto
    });
  }
});

/**
 * GET /api/ebay/:producto
 * Busca solo en eBay
 */
router.get('/ebay/:producto', async (req, res) => {
  try {
    const { producto } = req.params;
    
    if (!producto || producto.trim().length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar un producto a buscar'
      });
    }

    const cacheKey = generateCacheKey(producto, 'ebay');
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return res.json({
        ...cached.data,
        _cache: { hit: true, key: cacheKey, ttlRemaining: cached.ttlRemaining }
      });
    }

    console.log(`[Search] Buscando "${producto}" en eBay...`);
    const resultado = await buscarEnEbay(producto);

    if (resultado.exito) {
      setInCache(cacheKey, resultado);
    }

    res.json({
      ...resultado,
      fuente: 'eBay',
      moneda: 'MXN',
      _cache: { hit: false, key: cacheKey, ttl: 300 }
    });

  } catch (error) {
    console.error('[eBay Error]', error.message);
    res.status(500).json({
      exito: false,
      error: error.message,
      producto: req.params.producto
    });
  }
});

/**
 * GET /api/cache/stats
 * Obtiene estadisticas del cache
 */
router.get('/cache/stats', (req, res) => {
  res.json(getCacheStats());
});

/**
 * DELETE /api/cache/flush
 * Limpia todo el cache
 */
router.delete('/cache/flush', (req, res) => {
  flushCache();
  res.json({ message: 'Cache limpiado exitosamente' });
});

module.exports = router;
