/**
 * Servicio de filtrado inteligente de relevancia
 * Detecta y filtra accesorios no deseados de los resultados de búsqueda
 */

// Palabras clave que indican que es un accesorio, no el producto principal
const ACCESORIOS_KEYWORDS = {
  // Accesorios generales
  general: [
    'kit de montaje', 'kit montaje', 'mounting kit', 'mount kit', 
    'bracket', 'soporte', 'base', 'holder', 'stand',
    'cable', 'cord', 'wire', 'charger', 'cargador', 'adaptador', 'adapter',
    'case', 'funda', 'cover', 'protector', 'cubierta',
    'manual', 'guia', 'guide', 'instructivo',
    'tornillo', 'screw', 'accesorio', 'accessory', 'repuesto', 'replacement'
  ],
  
  // Accesorios específicos de consolas
  gaming: [
    'control ', 'controller ', 'mando', 'joystick',
    'headset', 'audifonos', 'headphones',
    'carrying case', 'estuche', 
    'skin', 'calcomanía', 'sticker',
    'volante', 'wheel', 'pedalera', 'pedals'
  ],
  
  // Accesorios de redes/routers
  networking: [
    'antenna', 'antena',
    'power supply', 'fuente de poder', 'power adapter',
    'ethernet cable', 'cable ethernet',
    'wall mount', 'montaje en pared'
  ]
};

// Palabras que indican el producto principal (no accesorios)
const PRODUCTO_PRINCIPAL_KEYWORDS = {
  gaming: ['console', 'consola', 'playstation', 'xbox', 'nintendo switch'],
  networking: ['router', 'access point', 'punto de acceso', 'switch', 'ap'],
  computers: ['laptop', 'notebook', 'desktop', 'pc', 'computer', 'macbook']
};

/**
 * Verifica si un título contiene indicadores de accesorios
 * @param {string} titulo - Título del producto
 * @returns {object} - { esAccesorio: boolean, razon: string }
 */
function esAccesorio(titulo) {
  const tituloLower = titulo.toLowerCase();
  
  // Verificar accesorios generales
  for (const keyword of ACCESORIOS_KEYWORDS.general) {
    if (tituloLower.includes(keyword)) {
      return { esAccesorio: true, razon: `Accesorio detectado: ${keyword}` };
    }
  }
  
  // Verificar accesorios de gaming
  for (const keyword of ACCESORIOS_KEYWORDS.gaming) {
    if (tituloLower.includes(keyword)) {
      return { esAccesorio: true, razon: `Accesorio gaming detectado: ${keyword}` };
    }
  }
  
  // Verificar accesorios de redes
  for (const keyword of ACCESORIOS_KEYWORDS.networking) {
    if (tituloLower.includes(keyword)) {
      return { esAccesorio: true, razon: `Accesorio networking detectado: ${keyword}` };
    }
  }
  
  return { esAccesorio: false, razon: null };
}

/**
 * Calcula un score de relevancia para un producto
 * Mayor score = más relevante
 * @param {string} titulo - Título del producto
 * @param {string} busqueda - Términos de búsqueda originales
 * @returns {number} - Score de relevancia (0-100)
 */
function calcularScoreRelevancia(titulo, busqueda) {
  const tituloLower = titulo.toLowerCase();
  const palabrasBusqueda = busqueda.toLowerCase().split(/\s+/);
  let score = 0;
  
  // 1. Coincidencia exacta de todas las palabras (40 puntos)
  const todasLasPalabras = palabrasBusqueda.every(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'i');
    return regex.test(tituloLower);
  });
  
  if (todasLasPalabras) {
    score += 40;
  }
  
  // 2. Secuencia exacta de palabras (30 puntos adicionales)
  const busquedaLower = busqueda.toLowerCase();
  if (tituloLower.includes(busquedaLower)) {
    score += 30;
  }
  
  // 3. Palabras en el mismo orden (20 puntos)
  let posicionAnterior = -1;
  let ordenCorrecto = true;
  for (const palabra of palabrasBusqueda) {
    const posicion = tituloLower.indexOf(palabra);
    if (posicion < posicionAnterior) {
      ordenCorrecto = false;
      break;
    }
    posicionAnterior = posicion;
  }
  if (ordenCorrecto && posicionAnterior >= 0) {
    score += 20;
  }
  
  // 4. Bonus: palabras del producto principal (10 puntos)
  for (const categoria of Object.values(PRODUCTO_PRINCIPAL_KEYWORDS)) {
    for (const keyword of categoria) {
      if (tituloLower.includes(keyword)) {
        score += 10;
        break; // Solo un bonus por categoría
      }
    }
  }
  
  // 5. Penalización por palabras extra (reducir 1 punto por cada 10 palabras extra)
  const palabrasTitulo = tituloLower.split(/\s+/).length;
  const palabrasExtra = Math.max(0, palabrasTitulo - palabrasBusqueda.length);
  score -= Math.floor(palabrasExtra / 10);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Detecta outliers de precio (probablemente accesorios baratos)
 * @param {number[]} precios - Array de precios
 * @returns {object} - { umbralMinimo: number, umbralMaximo: number }
 */
function detectarOutliers(precios) {
  if (precios.length < 3) {
    return { umbralMinimo: 0, umbralMaximo: Infinity };
  }
  
  // Ordenar precios
  const preciosOrdenados = [...precios].sort((a, b) => a - b);
  
  // Calcular cuartiles
  const q1Index = Math.floor(preciosOrdenados.length * 0.25);
  const q3Index = Math.floor(preciosOrdenados.length * 0.75);
  
  const q1 = preciosOrdenados[q1Index];
  const q3 = preciosOrdenados[q3Index];
  const iqr = q3 - q1;
  
  // Definir umbrales (método IQR - rango intercuartil)
  // Usamos 1.5 * IQR como estándar para outliers
  const umbralMinimo = Math.max(0, q1 - 1.5 * iqr);
  const umbralMaximo = q3 + 1.5 * iqr;
  
  return { umbralMinimo, umbralMaximo };
}

/**
 * Filtra productos aplicando todas las reglas de relevancia
 * @param {Array} productos - Array de productos con {titulo, precio, ...}
 * @param {string} busqueda - Términos de búsqueda originales
 * @param {object} opciones - Opciones de filtrado
 * @returns {object} - { productosRelevantes, productosExcluidos, estadisticas }
 */
function filtrarProductosRelevantes(productos, busqueda, opciones = {}) {
  const {
    filtrarAccesorios = true,
    filtrarOutliers = true,
    scoreMinimo = 40,
    preservarCoincidenciasExactas = true
  } = opciones;
  
  const productosRelevantes = [];
  const productosExcluidos = [];
  
  // 1. Calcular scores de relevancia para todos
  const productosConScore = productos.map(producto => ({
    ...producto,
    scoreRelevancia: calcularScoreRelevancia(producto.titulo, busqueda),
    esAccesorio: esAccesorio(producto.titulo)
  }));
  
  // 2. Detectar outliers de precio
  const precios = productos.map(p => p.precioMXN || parseFloat(p.precio) || 0).filter(p => p > 0);
  const { umbralMinimo, umbralMaximo } = detectarOutliers(precios);
  
  // 3. Aplicar filtros
  for (const producto of productosConScore) {
    let razonExclusion = null;
    const precio = producto.precioMXN || parseFloat(producto.precio) || 0;
    
    // Filtro 1: Accesorios
    if (filtrarAccesorios && producto.esAccesorio.esAccesorio) {
      razonExclusion = producto.esAccesorio.razon;
    }
    
    // Filtro 2: Score de relevancia bajo
    else if (producto.scoreRelevancia < scoreMinimo) {
      razonExclusion = `Score de relevancia bajo: ${producto.scoreRelevancia}`;
    }
    
    // Filtro 3: Outliers de precio
    else if (filtrarOutliers && (precio < umbralMinimo || precio > umbralMaximo)) {
      razonExclusion = `Precio outlier: ${precio} (rango: ${umbralMinimo.toFixed(2)} - ${umbralMaximo.toFixed(2)})`;
    }
    
    // Excepción: preservar coincidencias exactas de alta calidad
    if (razonExclusion && preservarCoincidenciasExactas && 
        producto.coincidenciaExacta && producto.scoreRelevancia >= 60) {
      razonExclusion = null; // No excluir
    }
    
    if (razonExclusion) {
      productosExcluidos.push({
        ...producto,
        razonExclusion
      });
    } else {
      productosRelevantes.push(producto);
    }
  }
  
  // 4. Ordenar productos relevantes por score
  productosRelevantes.sort((a, b) => {
    // Primero por coincidencia exacta
    if (a.coincidenciaExacta !== b.coincidenciaExacta) {
      return a.coincidenciaExacta ? -1 : 1;
    }
    // Luego por score de relevancia
    return b.scoreRelevancia - a.scoreRelevancia;
  });
  
  // 5. Estadísticas
  const estadisticas = {
    totalOriginal: productos.length,
    totalRelevantes: productosRelevantes.length,
    totalExcluidos: productosExcluidos.length,
    excluidos: {
      porAccesorios: productosExcluidos.filter(p => p.esAccesorio.esAccesorio).length,
      porScoreBajo: productosExcluidos.filter(p => p.razonExclusion.includes('Score')).length,
      porOutliers: productosExcluidos.filter(p => p.razonExclusion.includes('Precio outlier')).length
    },
    umbralPrecio: { umbralMinimo, umbralMaximo },
    scorePromedio: productosRelevantes.length > 0 
      ? productosRelevantes.reduce((sum, p) => sum + p.scoreRelevancia, 0) / productosRelevantes.length 
      : 0
  };
  
  return {
    productosRelevantes,
    productosExcluidos,
    estadisticas
  };
}

module.exports = {
  esAccesorio,
  calcularScoreRelevancia,
  detectarOutliers,
  filtrarProductosRelevantes,
  ACCESORIOS_KEYWORDS,
  PRODUCTO_PRINCIPAL_KEYWORDS
};
