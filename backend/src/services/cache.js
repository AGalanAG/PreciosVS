/**
 * Servicio de cache con node-cache
 * TTL de 5 minutos para busquedas
 */

const NodeCache = require('node-cache');

const searchCache = new NodeCache({
  stdTTL: 300,           // 5 minutos
  checkperiod: 60,       // Verificar expiracion cada minuto
  useClones: true,
  deleteOnExpire: true
});

/**
 * Genera una clave de cache normalizada
 * @param {string} query - Termino de busqueda
 * @param {string} source - Fuente (all, mercadolibre, ebay)
 * @param {object} opciones - Opciones de filtrado (opcional)
 * @returns {string} Clave de cache
 */
function generateCacheKey(query, source = 'all', opciones = {}) {
  const baseKey = `search:${source}:${query.toLowerCase().trim().replace(/\s+/g, '-')}`;
  
  // Si hay opciones, añadirlas a la clave
  if (opciones && Object.keys(opciones).length > 0) {
    const opcionesStr = JSON.stringify(opciones);
    const opcionesHash = Buffer.from(opcionesStr).toString('base64').substring(0, 8);
    return `${baseKey}:${opcionesHash}`;
  }
  
  return baseKey;
}

/**
 * Obtiene datos del cache
 * @param {string} key - Clave de cache
 * @returns {object|undefined} Datos cacheados o undefined
 */
function getFromCache(key) {
  const cached = searchCache.get(key);
  if (cached) {
    console.log(`[Cache HIT] ${key}`);
    return {
      data: cached,
      hit: true,
      ttlRemaining: Math.max(0, searchCache.getTtl(key) - Date.now())
    };
  }
  console.log(`[Cache MISS] ${key}`);
  return null;
}

/**
 * Guarda datos en cache
 * @param {string} key - Clave de cache
 * @param {object} data - Datos a cachear
 */
function setInCache(key, data) {
  searchCache.set(key, data);
  console.log(`[Cache SET] ${key}`);
}

/**
 * Obtiene estadisticas del cache
 * @returns {object} Estadisticas
 */
function getCacheStats() {
  return {
    stats: searchCache.getStats(),
    keys: searchCache.keys(),
    keyCount: searchCache.keys().length
  };
}

/**
 * Limpia todo el cache
 */
function flushCache() {
  searchCache.flushAll();
  console.log('[Cache] Flushed all keys');
}

module.exports = {
  generateCacheKey,
  getFromCache,
  setInCache,
  getCacheStats,
  flushCache
};
