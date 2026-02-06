<script lang="ts">
  import type { Analisis } from '$lib/services/api';
  
  export let analisis: Analisis;
  
  function formatPrice(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }
  
  function formatPriceUSD(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }
</script>

<div class="price-summary">
  <div class="columns is-multiline">
    <!-- Precio Sugerido -->
    <div class="column is-4">
      <div class="box price-box price-box-suggested">
        <div class="has-text-centered">
          <span class="icon is-large price-icon-suggested">
            <i class="fas fa-tag fa-2x"></i>
          </span>
          <p class="heading">Precio Sugerido de Venta</p>
          <p class="title is-4 price-text-suggested">
            {formatPrice(analisis.precioSugerido?.valor)}
          </p>
          <p class="is-size-7 has-text-grey">
            {formatPriceUSD(analisis.precioSugerido?.valorUSD)} (aprox.)
          </p>
          <p class="is-size-7">
            <span class="tag is-primary is-light">Percentil 25</span>
          </p>
          {#if analisis.mensaje}
            <p class="is-size-7 has-text-grey mt-2">
              {analisis.mensaje}
            </p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Precio Maximo -->
    <div class="column is-4">
      <div class="box price-box price-box-max">
        <div class="has-text-centered">
          <span class="icon is-large price-icon-max">
            <i class="fas fa-arrow-up fa-2x"></i>
          </span>
          <p class="heading">Precio Maximo</p>
          <p class="title is-4 price-text-max">
            {formatPrice(analisis.precioMaximo?.valor)}
          </p>
          <p class="is-size-7 has-text-grey">
            {formatPriceUSD(analisis.precioMaximo?.valorUSD)} (aprox.)
          </p>
          {#if analisis.precioMaximo?.fuente}
            <p class="is-size-7">
              <span class="tag is-light">{analisis.precioMaximo.fuente}</span>
            </p>
          {/if}
          {#if analisis.precioMaximo?.titulo}
            <p class="is-size-7 has-text-grey mt-2 truncate-text">
              {analisis.precioMaximo.titulo}
            </p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Precio Minimo -->
    <div class="column is-4">
      <div class="box price-box price-box-min">
        <div class="has-text-centered">
          <span class="icon is-large price-icon-min">
            <i class="fas fa-arrow-down fa-2x"></i>
          </span>
          <p class="heading">Precio Minimo</p>
          <p class="title is-4 price-text-min">
            {formatPrice(analisis.precioMinimo?.valor)}
          </p>
          <p class="is-size-7 has-text-grey">
            {formatPriceUSD(analisis.precioMinimo?.valorUSD)} (aprox.)
          </p>
          {#if analisis.precioMinimo?.fuente}
            <p class="is-size-7">
              <span class="tag is-light">{analisis.precioMinimo.fuente}</span>
            </p>
          {/if}
          {#if analisis.precioMinimo?.titulo}
            <p class="is-size-7 has-text-grey mt-2 truncate-text">
              {analisis.precioMinimo.titulo}
            </p>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Resumen adicional -->
  <div class="summary-info has-text-centered mt-4">
    <p class="is-size-6 summary-main">
      <strong class="summary-label">Precio Promedio:</strong> 
      <span class="summary-price">{formatPrice(analisis.precioPromedio?.valor)}</span>
      <span class="summary-usd">({formatPriceUSD(analisis.precioPromedio?.valorUSD)} aprox.)</span>
    </p>
    <p class="is-size-7 summary-products">
      Productos analizados: <strong>{analisis.productosAnalizados ?? analisis.totalProductos}</strong> con coincidencia exacta
      {#if analisis.totalProductos && analisis.productosAnalizados !== analisis.totalProductos}
        <span class="summary-total"> (de {analisis.totalProductos} resultados totales)</span>
      {/if}
    </p>
  </div>
</div>

<style>
  .price-summary {
    margin: 2rem 0;
  }
  
  .price-box {
    height: 100%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .price-box:hover {
    transform: translateY(-4px);
    box-shadow: 6px 6px 0 var(--color-stroke);
  }

  /* Precio Mínimo - Secondary (turquesa) */
  .price-box-min {
    background-color: var(--color-secondary) !important;
  }

  .price-icon-min {
    color: var(--color-headline);
  }

  .price-text-min {
    color: var(--color-headline) !important;
  }

  /* Precio Máximo - Tertiary (rosa) */
  .price-box-max {
    background-color: var(--color-tertiary) !important;
  }

  .price-icon-max {
    color: var(--color-button-text);
  }

  .price-text-max {
    color: var(--color-button-text) !important;
  }

  /* Precio Sugerido - Main (melocotón) */
  .price-box-suggested {
    background-color: var(--color-main) !important;
  }

  .price-icon-suggested {
    color: var(--color-headline);
  }

  .price-text-suggested {
    color: var(--color-headline) !important;
  }
  
  .heading {
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    color: var(--color-headline);
  }
  
  .truncate-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Estilos para el resumen del precio promedio */
  .summary-info {
    background-color: #fff;
    border: 2px solid var(--color-stroke);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    box-shadow: 3px 3px 0 var(--color-stroke);
  }

  .summary-main {
    margin-bottom: 0.5rem;
  }

  .summary-label {
    color: var(--color-headline);
    font-weight: 700;
  }

  .summary-price {
    color: var(--color-button);
    font-weight: 700;
    font-size: 1.1em;
  }

  .summary-usd {
    color: var(--color-paragraph);
    font-size: 0.9em;
  }

  .summary-products {
    color: var(--color-paragraph);
  }

  .summary-products strong {
    color: var(--color-headline);
    font-weight: 700;
  }

  .summary-total {
    color: var(--color-paragraph);
    opacity: 0.7;
  }
</style>
