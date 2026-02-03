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

<tr>
  <td class="has-text-centered">
    <span class="tag is-light">{producto.posicion}</span>
  </td>
  <td>
    <p class="has-text-weight-medium" title={producto.titulo}>
      {truncateText(producto.titulo, 60)}
    </p>
    <p class="is-size-7">
      {#if producto.coincidenciaExacta}
        <span class="tag is-success is-light">Coincidencia exacta</span>
      {:else}
        <span class="tag is-warning is-light">Coincidencia parcial</span>
      {/if}
    </p>
  </td>
  <td class="has-text-right">
    <p class="has-text-weight-bold has-text-success">
      ${formatPrice(producto.precioMXN)} MXN
    </p>
    <p class="is-size-7 has-text-grey">
      ${formatPrice(producto.precioUSD)} USD
    </p>
  </td>
  <td class="has-text-centered">
    {#if producto.fuente === 'MercadoLibre'}
      <span class="tag is-warning">ML</span>
    {:else}
      <span class="tag is-link">eBay</span>
    {/if}
  </td>
  <td class="has-text-centered">
    <a 
      href={producto.link} 
      target="_blank" 
      rel="noopener noreferrer"
      class="button is-small is-outlined is-primary"
    >
      <span class="icon is-small">
        <i class="fas fa-external-link-alt"></i>
      </span>
      <span>Ver</span>
    </a>
  </td>
</tr>

<style>
  tr:hover {
    background-color: var(--color-main) !important;
  }
  
  td {
    vertical-align: middle !important;
    background-color: transparent !important;
  }

  :global(.has-text-success) {
    color: var(--color-headline) !important;
  }
</style>
