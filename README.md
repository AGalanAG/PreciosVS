# Comparador de Precios - MercadoLibre y eBay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

Aplicación web para comparar precios de productos entre MercadoLibre México y eBay. Permite buscar productos por nombre o número de serie y obtiene:

- Precio mínimo encontrado
- Precio máximo encontrado
- Precio sugerido de venta (percentil 25 - más bajo que el 75% del mercado)

## Características Actuales

- Búsqueda en paralelo (MercadoLibre y eBay simultáneamente)
- Sistema de caché inteligente (TTL: 5 minutos)
- Cálculo de precio sugerido usando percentil 25
- Interfaz responsive con Bulma CSS
- Clasificación de coincidencias exactas vs parciales
- Web scraping robusto con Puppeteer

## Roadmap - Próximas Versiones

### v2.0 - Integración con API de MercadoLibre
- Conexión con API oficial de MercadoLibre
- Sincronización automática con cuenta del cliente
- Comparación de precios publicados vs mercado
- Actualización masiva de precios

### v3.0 - Sistema de Monitoreo y Notificaciones
- Monitoreo continuo de precios del mercado
- Notificaciones por cambios drásticos de precios
- Alertas por correo/Telegram/WhatsApp
- Dashboard de análisis de competencia
- Histórico de precios y tendencias

### v4.0 - Análisis Avanzado
- Machine Learning para predicción de precios
- Análisis de competencia automático
- Recomendaciones de pricing dinámico
- Reportes y estadísticas avanzadas

## Estructura del Proyecto

```
PreciosVS/
├── backend/                 # API Express con Node.js
│   ├── src/
│   │   ├── scrapers/       # Modulos de scraping
│   │   │   ├── mercadolibre.scraper.js
│   │   │   ├── ebay.scraper.js
│   │   │   └── index.js
│   │   ├── services/       # Servicios de negocio
│   │   │   ├── price.service.js
│   │   │   └── cache.js
│   │   ├── routes/         # Rutas de la API
│   │   │   └── search.routes.js
│   │   └── app.js          # Configuracion de Express
│   ├── index.js            # Punto de entrada
│   └── package.json
├── frontend/               # Aplicacion SvelteKit
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/ # Componentes Svelte
│   │   │   └── services/   # Servicios de API
│   │   └── routes/         # Paginas
│   └── package.json
└── docs/                   # Documentacion de scrapers
    ├── MERCADOLIBRE.md
    └── EBAY.md
```

## Requisitos

- Node.js 18 o superior
- npm o yarn
- Git

## Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/TU_USUARIO/PreciosVS.git
cd PreciosVS
```

2. **Configurar el Backend**

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Configurar el Frontend**

```bash
cd ../frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend
```

## Ejecución

### Modo desarrollo

1. Iniciar el backend (puerto 3000):

```bash
cd backend
npm start
```

2. En otra terminal, iniciar el frontend (puerto 5173):

```bash
cd frontend
npm run dev
```

3. Abrir http://localhost:5173 en el navegador

### Modo producción

1. Compilar el frontend:

```bash
cd frontend
npm run build
```

2. Iniciar el backend y servir el frontend compilado (requiere configuración adicional).

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/search/:producto` | Busca en MercadoLibre y eBay |
| GET | `/api/mercadolibre/:producto` | Busca solo en MercadoLibre |
| GET | `/api/ebay/:producto` | Busca solo en eBay |
| GET | `/api/cache/stats` | Estadísticas del caché |
| DELETE | `/api/cache/flush` | Limpia el caché |

## Notas Técnicas

### Precio Sugerido

El precio sugerido se calcula usando el percentil 25 de todos los precios encontrados. Esto significa que el precio sugerido es más bajo que el 75% de los productos en el mercado, ideal para ofrecer precios competitivos.

### Caché

Las búsquedas se cachean durante 5 minutos para evitar peticiones repetitivas a los sitios de e-commerce y mejorar el tiempo de respuesta.

## Documentación Adicional

- [Scraper de MercadoLibre](docs/MERCADOLIBRE.md)
- [Scraper de eBay](docs/EBAY.md)

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Reportar Problemas

Si encuentras algún bug o tienes una sugerencia, por favor abre un [issue](https://github.com/TU_USUARIO/PreciosVS/issues).

## Contacto

Para consultas sobre integración con la API de MercadoLibre o el sistema de monitoreo, por favor contacta al equipo de desarrollo.
