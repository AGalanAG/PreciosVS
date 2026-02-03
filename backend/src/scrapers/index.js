/**
 * Modulo central de scrapers
 * Exporta funciones de busqueda para MercadoLibre y eBay
 */

const buscarEnMercadoLibre = require('./mercadolibre.scraper');
const buscarEnEbay = require('./ebay.scraper');

module.exports = {
  buscarEnMercadoLibre,
  buscarEnEbay
};
