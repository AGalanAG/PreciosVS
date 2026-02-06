<script lang="ts">
  import type { ProductoResultado } from '$lib/services/api';
  
  export let producto: ProductoResultado;
  
  function formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
</script>

<div class="product-card">
  <div class="card-header">
    <span class="position-badge">{producto.posicion}</span>
    {#if producto.fuente === 'MercadoLibre'}
      <span class="tag is-warning">ML</span>
    {:else}
      <span class="tag is-link">eBay</span>
    {/if}
  </div>
  
  <div class="image-container">
    {#if producto.imagen}
      <img 
        src={producto.imagen} 
        alt={producto.titulo}
        loading="lazy"
        class="product-image"
      />
    {:else}
      <div class="no-image">
        <i class="fas fa-image fa-3x"></i>
      </div>
    {/if}
  </div>
  
  <div class="card-content">
    <div class="match-tag">
      {#if producto.coincidenciaExacta}
        <span class="tag is-success is-light">Coincidencia exacta</span>
      {:else}
        <span class="tag is-warning is-light">Coincidencia parcial</span>
      {/if}
    </div>
    
    <h3 class="product-title" title={producto.titulo}>
      {truncateText(producto.titulo, 80)}
    </h3>
    
    <div class="price-section">
      <p class="price-mxn">
        ${formatPrice(producto.precioMXN)} MXN
      </p>
      <p class="price-usd">
        ${formatPrice(producto.precioUSD)} USD
      </p>
      {#if producto.fuente === 'eBay' && producto.precioEnvio}
        <p class="shipping-info">
          <span class="icon is-small">
            <i class="fas fa-shipping-fast"></i>
          </span>
          Envío: ${formatPrice(parseFloat(producto.precioEnvio))} MXN
        </p>
      {/if}
    </div>
    
    <a 
      href={producto.link} 
      target="_blank" 
      rel="noopener noreferrer"
      class="button is-primary is-fullwidth"
    >
      <span class="icon is-small">
        <i class="fas fa-external-link-alt"></i>
      </span>
      <span>Ver Producto</span>
    </a>
  </div>
</div>

<style>
  .product-card {
    background: #fff;
    border: 2px solid var(--color-stroke);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--color-button);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--color-main);
    border-bottom: 1px solid var(--color-stroke);
  }
  
  .position-badge {
    background-color: var(--color-button);
    color: var(--color-button-text);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .image-container {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-bottom: 1px solid var(--color-stroke);
    overflow: hidden;
  }
  
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 1rem;
  }
  
  .no-image {
    color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }
  
  .match-tag {
    display: flex;
    justify-content: center;
  }
  
  .product-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-headline);
    line-height: 1.4;
    min-height: 3.5rem;
    margin: 0;
  }
  
  .price-section {
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-stroke);
  }
  
  .price-mxn {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-headline);
    margin-bottom: 0.25rem;
  }
  
  .price-usd {
    font-size: 0.875rem;
    color: var(--color-paragraph);
    margin-bottom: 0.5rem;
  }
  
  .shipping-info {
    font-size: 0.75rem;
    color: var(--color-paragraph);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .button {
    margin-top: 0.75rem;
  }
</style>
