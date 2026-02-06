# Filtrado Inteligente de Relevancia

## Descripción

El sistema de filtrado inteligente ayuda a distinguir entre el producto principal que estás buscando y sus accesorios o productos relacionados pero no deseados.

## ¿Cómo funciona?

### 1. Detección de Accesorios
El sistema detecta automáticamente accesorios comunes usando palabras clave:

**Accesorios generales:**
- Kits de montaje
- Soportes y bases
- Cables y cargadores
- Fundas y protectores
- Manuales y guías
- Tornillos y repuestos

**Accesorios de Gaming:**
- Controles y mandos
- Audífonos y headsets
- Estuches de transporte
- Skins y calcomanías

**Accesorios de Redes:**
- Antenas
- Fuentes de poder
- Cables Ethernet
- Kits de montaje en pared

### 2. Score de Relevancia (0-100)

Cada producto recibe un score basado en:
- **Coincidencia exacta** (40 puntos): Todas las palabras de búsqueda aparecen
- **Secuencia exacta** (30 puntos): Las palabras aparecen en el mismo orden
- **Orden correcto** (20 puntos): Las palabras mantienen el orden relativo
- **Producto principal** (10 puntos): Contiene palabras clave del producto principal
- **Penalización**: -1 punto por cada 10 palabras extra en el título

### 3. Detección de Outliers de Precio

Usa el método IQR (Rango Intercuartil) para detectar precios anómalos:
- Precios muy bajos probablemente son accesorios
- Precios muy altos pueden ser bundles o ediciones especiales

## Uso de la API

### Endpoint Principal

```
GET /api/search/:producto
```

### Parámetros de Query (opcionales)

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `filtroInteligente` | boolean | `true` | Activa/desactiva el filtrado inteligente |
| `filtrarAccesorios` | boolean | `true` | Excluye productos detectados como accesorios |
| `filtrarOutliers` | boolean | `true` | Excluye precios outliers |
| `scoreMinimo` | number | `40` | Score mínimo de relevancia (0-100) |

### Ejemplos

**Búsqueda con filtrado activado (default):**
```
GET /api/search/cisco meraki mr34
```

**Búsqueda sin filtrado:**
```
GET /api/search/cisco meraki mr34?filtroInteligente=false
```

**Búsqueda personalizada:**
```
GET /api/search/playstation 5?filtrarAccesorios=true&filtrarOutliers=true&scoreMinimo=50
```

**Permitir accesorios pero filtrar outliers:**
```
GET /api/search/playstation 5?filtrarAccesorios=false&filtrarOutliers=true
```

## Respuesta de la API

La respuesta incluye información adicional sobre el filtrado:

```json
{
  "exito": true,
  "producto": "cisco meraki mr34",
  "analisis": {
    "precioMinimo": {...},
    "precioMaximo": {...},
    "productosRelevantes": 12,
    "productosExcluidos": 3,
    "mensaje": "Precio basado en 8 productos relevantes con coincidencia exacta (3 productos excluidos por baja relevancia)",
    "filtrado": {
      "totalOriginal": 15,
      "totalRelevantes": 12,
      "totalExcluidos": 3,
      "excluidos": {
        "porAccesorios": 2,
        "porScoreBajo": 0,
        "porOutliers": 1
      },
      "umbralPrecio": {
        "umbralMinimo": 2500.00,
        "umbralMaximo": 12000.00
      },
      "scorePromedio": 75.5
    }
  },
  "resultados": {
    "mercadolibre": {
      "productos": [...]
    },
    "ebay": {
      "productos": [...]
    }
  },
  "productosExcluidos": [
    {
      "titulo": "Kit de Montaje Cisco Meraki MR34",
      "precio": "450.00",
      "scoreRelevancia": 55,
      "razonExclusion": "Accesorio detectado: kit de montaje",
      "esAccesorio": {
        "esAccesorio": true,
        "razon": "Accesorio detectado: kit de montaje"
      }
    }
  ]
}
```

## Casos de Uso

### Ejemplo 1: Router con Accesorios

**Búsqueda:** "cisco meraki mr34"

**Productos encontrados:**
- ✅ Cisco Meraki MR34 Access Point (producto principal)
- ❌ Kit de Montaje para MR34 (excluido: accesorio)
- ❌ Antena de repuesto MR34 (excluido: accesorio)

### Ejemplo 2: Consola con Accesorios

**Búsqueda:** "playstation 5"

**Productos encontrados:**
- ✅ PlayStation 5 Console Digital Edition (producto principal)
- ✅ PlayStation 5 Console Standard (producto principal)
- ❌ Control DualSense PS5 (excluido: accesorio)
- ❌ Estuche de viaje PS5 (excluido: accesorio)
- ❌ Cable HDMI para PS5 (excluido: accesorio)

### Ejemplo 3: Laptop con Accesorios

**Búsqueda:** "macbook pro 16"

**Productos encontrados:**
- ✅ MacBook Pro 16" M3 (producto principal)
- ✅ MacBook Pro 16" M2 (producto principal)
- ❌ Cargador MacBook Pro (excluido: accesorio)
- ❌ Funda para MacBook Pro 16" (excluido: accesorio)

## Ventajas

1. **Mayor precisión** en la comparación de precios al excluir accesorios
2. **Análisis más confiable** basado solo en el producto principal
3. **Flexibilidad** para ajustar el nivel de filtrado según necesidades
4. **Transparencia** mostrando qué productos fueron excluidos y por qué
5. **Preservación de coincidencias de alta calidad** incluso si tienen características de accesorios

## Notas Técnicas

- El filtrado se aplica después de obtener los resultados de ambas fuentes
- Los productos con score >= 60 y coincidencia exacta son preservados automáticamente
- El sistema está optimizado para productos tecnológicos (routers, consolas, laptops)
- El cache considera las opciones de filtrado para evitar resultados incorrectos

## Personalización

Para añadir nuevas palabras clave de accesorios, edita el archivo:
```
backend/src/services/relevance.filter.js
```

En las constantes:
- `ACCESORIOS_KEYWORDS`: Palabras que indican accesorios
- `PRODUCTO_PRINCIPAL_KEYWORDS`: Palabras que indican producto principal
