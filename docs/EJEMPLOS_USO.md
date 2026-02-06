# Guía de Uso: Filtrado Inteligente - Ejemplos Prácticos

## 🎯 Introducción

Esta guía muestra ejemplos prácticos de cómo usar el filtrado inteligente para obtener mejores resultados en tus búsquedas.

## 📋 Casos de Uso Comunes

### Caso 1: Buscar un Router sin Accesorios

**Problema:** Buscas un router Cisco Meraki MR34 pero aparecen kits de montaje, antenas y cables.

**Solución:** Usar filtrado inteligente (activado por defecto)

```bash
# Bash/cURL
curl "http://localhost:3847/api/search/cisco%20meraki%20mr34"

# JavaScript/Fetch
fetch('http://localhost:3847/api/search/cisco%20meraki%20mr34')
  .then(res => res.json())
  .then(data => console.log(data));

# Python
import requests
response = requests.get('http://localhost:3847/api/search/cisco meraki mr34')
data = response.json()
```

**Resultado esperado:**
```json
{
  "analisis": {
    "productosRelevantes": 7,
    "productosExcluidos": 8,
    "filtrado": {
      "excluidos": {
        "porAccesorios": 5,
        "porScoreBajo": 1,
        "porOutliers": 2
      }
    }
  }
}
```

---

### Caso 2: Buscar una Consola sin Controles

**Problema:** Buscas una PlayStation 5 pero aparecen controles, fundas y cables.

**Solución:** Filtrado inteligente detecta automáticamente los accesorios

```bash
curl "http://localhost:3847/api/search/playstation%205"
```

**Productos excluidos automáticamente:**
- ❌ Control DualSense PS5
- ❌ Cargador para PS5
- ❌ Funda de transporte
- ❌ Cable HDMI para PS5
- ❌ Soporte vertical

**Productos incluidos:**
- ✅ PlayStation 5 Console Digital Edition
- ✅ PlayStation 5 Console Standard
- ✅ PlayStation 5 Bundle con juego

---

### Caso 3: Ajustar el Nivel de Filtrado

**Escenario:** El filtrado por defecto es demasiado estricto para tu caso.

#### Opción A: Ser más permisivo (score mínimo bajo)

```bash
curl "http://localhost:3847/api/search/macbook%20pro?scoreMinimo=30"
```

**Efecto:** Incluye más productos, incluso algunos con relevancia media-baja

#### Opción B: Ser más estricto (score mínimo alto)

```bash
curl "http://localhost:3847/api/search/iphone%2015?scoreMinimo=70"
```

**Efecto:** Solo productos altamente relevantes

#### Opción C: Permitir accesorios pero filtrar outliers

```bash
curl "http://localhost:3847/api/search/macbook%20pro?filtrarAccesorios=false&filtrarOutliers=true"
```

**Efecto:** Muestra accesorios relevantes pero excluye precios anómalos

---

### Caso 4: Desactivar Completamente el Filtrado

**Escenario:** Quieres ver absolutamente todos los resultados.

```bash
curl "http://localhost:3847/api/search/cisco%20meraki?filtroInteligente=false"
```

**Efecto:** 
- No se aplica ningún filtro
- Todos los productos aparecen
- Útil para debugging o análisis completo

---

### Caso 5: Búsqueda de Productos con Variantes

**Problema:** Buscas "MacBook Pro 16" pero hay M1, M2, M3...

**Solución:** El filtrado mantiene todas las variantes relevantes

```bash
curl "http://localhost:3847/api/search/macbook%20pro%2016"
```

**Productos incluidos:**
- ✅ MacBook Pro 16" M3 Pro
- ✅ MacBook Pro 16" M2 Max
- ✅ MacBook Pro 16" M1 Pro
- ✅ MacBook Pro 16" Intel (si hay)

**Productos excluidos:**
- ❌ Cargador MacBook Pro
- ❌ Funda para MacBook
- ❌ USB-C Hub

---

## 🔧 Configuraciones Avanzadas

### Configuración 1: Solo Productos Exactos, Sin Outliers

```bash
curl "http://localhost:3847/api/search/producto?scoreMinimo=80&filtrarOutliers=true"
```

**Uso:** Cuando necesitas máxima precisión

---

### Configuración 2: Incluir Accesorios Premium

```bash
curl "http://localhost:3847/api/search/iphone%2015?filtrarAccesorios=false&scoreMinimo=60"
```

**Uso:** Para ver accesorios oficiales o de alta calidad

---

### Configuración 3: Análisis Completo del Mercado

```bash
curl "http://localhost:3847/api/search/producto?filtroInteligente=false"
```

**Uso:** Estudios de mercado, análisis de competencia completa

---

## 📊 Interpretando los Resultados

### Ejemplo de Respuesta Completa

```json
{
  "exito": true,
  "producto": "cisco meraki mr34",
  "analisis": {
    "precioMinimo": {
      "valor": 8250.00,
      "valorUSD": 434.21,
      "fuente": "eBay",
      "titulo": "Cisco Meraki MR34 Cloud Managed AP"
    },
    "precioMaximo": {
      "valor": 12500.00,
      "valorUSD": 657.89,
      "fuente": "MercadoLibre",
      "titulo": "Cisco Meraki MR34 802.11ac Wave 2"
    },
    "precioPromedio": {
      "valor": 9875.50,
      "valorUSD": 519.76
    },
    "precioSugerido": {
      "valor": 8650.00,
      "valorUSD": 455.26,
      "metodo": "percentil25"
    },
    "productosRelevantes": 7,
    "productosExcluidos": 8,
    "mensaje": "Precio basado en 7 productos relevantes...",
    "filtrado": {
      "totalOriginal": 15,
      "totalRelevantes": 7,
      "totalExcluidos": 8,
      "excluidos": {
        "porAccesorios": 5,
        "porScoreBajo": 1,
        "porOutliers": 2
      },
      "umbralPrecio": {
        "umbralMinimo": 7500.00,
        "umbralMaximo": 13000.00
      },
      "scorePromedio": 78.5
    }
  },
  "resultados": {
    "mercadolibre": {
      "productos": [
        {
          "titulo": "Cisco Meraki MR34 802.11ac Wave 2",
          "precio": "12500.00",
          "precioMXN": 12500.00,
          "scoreRelevancia": 85,
          "coincidenciaExacta": true,
          "fuente": "MercadoLibre"
        }
      ]
    },
    "ebay": {
      "productos": [...]
    }
  },
  "productosExcluidos": [
    {
      "titulo": "Kit de Montaje Pared Cisco Meraki MR34",
      "precio": "450.00",
      "scoreRelevancia": 65,
      "razonExclusion": "Accesorio detectado: kit de montaje",
      "fuente": "MercadoLibre"
    }
  ]
}
```

### Campos Importantes

| Campo | Descripción |
|-------|-------------|
| `productosRelevantes` | Número de productos que pasaron el filtro |
| `productosExcluidos` | Número de productos excluidos |
| `scoreRelevancia` | Puntuación 0-100 de relevancia |
| `razonExclusion` | Por qué se excluyó un producto |
| `umbralPrecio` | Rango de precios válidos |

---

## 💡 Mejores Prácticas

### ✅ Hacer

1. **Usar términos específicos**
   ```
   ✅ "cisco meraki mr34"
   ✅ "playstation 5 digital edition"
   ✅ "macbook pro 16 m3"
   ```

2. **Revisar productos excluidos** para verificar el filtrado
   ```javascript
   if (resultado.productosExcluidos.length > 0) {
     console.log('Productos excluidos:', resultado.productosExcluidos);
   }
   ```

3. **Ajustar parámetros según necesidad**
   ```bash
   # Primera búsqueda: default
   curl "/api/search/producto"
   
   # Si necesitas más resultados: bajar score
   curl "/api/search/producto?scoreMinimo=30"
   ```

### ❌ Evitar

1. **Búsquedas muy genéricas**
   ```
   ❌ "router"
   ❌ "laptop"
   ❌ "celular"
   ```

2. **Desactivar filtrado sin necesidad**
   ```
   ❌ filtroInteligente=false (para uso general)
   ```

3. **Score mínimo muy bajo**
   ```
   ❌ scoreMinimo=0 (incluirá todo)
   ```

---

## 🧪 Modo de Prueba

Para experimentar con diferentes configuraciones:

```bash
# Crear un script de prueba
cat > test-config.sh << 'EOF'
#!/bin/bash

PRODUCTO="cisco meraki mr34"
BASE_URL="http://localhost:3847/api/search"

echo "=== Test 1: Default ==="
curl -s "$BASE_URL/$PRODUCTO" | jq '.analisis.filtrado'

echo -e "\n=== Test 2: Más permisivo ==="
curl -s "$BASE_URL/$PRODUCTO?scoreMinimo=30" | jq '.analisis.filtrado'

echo -e "\n=== Test 3: Más estricto ==="
curl -s "$BASE_URL/$PRODUCTO?scoreMinimo=70" | jq '.analisis.filtrado'

echo -e "\n=== Test 4: Sin filtrado ==="
curl -s "$BASE_URL/$PRODUCTO?filtroInteligente=false" | jq '.analisis'
EOF

chmod +x test-config.sh
./test-config.sh
```

---

## 🎓 Resumen

| Situación | Configuración Recomendada |
|-----------|--------------------------|
| Búsqueda general | Default (filtrado activado) |
| Producto muy específico | `scoreMinimo=60` |
| Quiero ver accesorios también | `filtrarAccesorios=false` |
| Análisis de mercado completo | `filtroInteligente=false` |
| Solo el más relevante | `scoreMinimo=80` |

---

## 📞 Soporte

Si encuentras productos que deberían excluirse pero no lo hacen:
1. Abre un issue en GitHub
2. Incluye el término de búsqueda
3. Especifica qué producto debería excluirse

Contribuciones al filtro son bienvenidas en:
`backend/src/services/relevance.filter.js`

---

**¡Felices búsquedas! 🚀**
