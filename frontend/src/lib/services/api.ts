/**
 * Servicio de API para comunicacion con el backend
 */

const API_BASE = '/api';

export interface ProductoResultado {
  posicion: number;
  titulo: string;
  precio: string;
  link: string;
  coincidenciaExacta: boolean;
  fuente: string;
  precioOriginal: string;
  monedaOriginal: string;
  precioMXN: number;
  precioUSD: number;
  precioProducto?: string;
  precioEnvio?: string;
  imagen?: string;
}

export interface PrecioInfo {
  valor: number;
  valorUSD: number;
  fuente?: string;
  titulo?: string;
  metodo?: string;
}

export interface Analisis {
  precioMinimo: PrecioInfo | null;
  precioMaximo: PrecioInfo | null;
  precioPromedio: PrecioInfo | null;
  precioSugerido: PrecioInfo | null;
  percentil25: number | null;
  totalProductos: number;
  productosAnalizados?: number;
  mensaje: string | null;
}

export interface ResultadosFuente {
  exito: boolean;
  total: number;
  coincidenciasExactas: number;
  coincidenciasParciales: number;
  productos: ProductoResultado[];
}

export interface BusquedaResponse {
  exito: boolean;
  producto: string;
  moneda: {
    principal: string;
    tasaCambio: {
      usdToMxn: number;
      aproximado: boolean;
      nota: string;
    };
  };
  analisis: Analisis;
  resultados: {
    mercadolibre: ResultadosFuente;
    ebay: ResultadosFuente;
  };
  timestamp: string;
  _cache?: {
    hit: boolean;
    key: string;
    ttl?: number;
    ttlRemaining?: number;
  };
  error?: string;
}

/**
 * Busca un producto en MercadoLibre y eBay
 */
export async function buscarProducto(producto: string): Promise<BusquedaResponse> {
  const response = await fetch(`${API_BASE}/search/${encodeURIComponent(producto)}`);
  
  if (!response.ok) {
    throw new Error(`Error en la busqueda: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Busca solo en MercadoLibre
 */
export async function buscarEnMercadoLibre(producto: string) {
  const response = await fetch(`${API_BASE}/mercadolibre/${encodeURIComponent(producto)}`);
  
  if (!response.ok) {
    throw new Error(`Error en MercadoLibre: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Busca solo en eBay
 */
export async function buscarEnEbay(producto: string) {
  const response = await fetch(`${API_BASE}/ebay/${encodeURIComponent(producto)}`);
  
  if (!response.ok) {
    throw new Error(`Error en eBay: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Obtiene estadisticas del cache
 */
export async function obtenerEstadisticasCache() {
  const response = await fetch(`${API_BASE}/cache/stats`);
  return response.json();
}
