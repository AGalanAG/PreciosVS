<script lang="ts">
  import type { ResultadosFuente, ProductoResultado } from '$lib/services/api';
  import ProductCard from './ProductCard.svelte';
  
  export let mercadolibre: ResultadosFuente;
  export let ebay: ResultadosFuente;
  
  let activeTab: 'todos' | 'mercadolibre' | 'ebay' = 'todos';
  
  $: todosLosProductos = [
    ...mercadolibre.productos,
    ...ebay.productos
  ].sort((a, b) => a.precioMXN - b.precioMXN);
  
  $: productosAMostrar = activeTab === 'todos' 
    ? todosLosProductos 
    : activeTab === 'mercadolibre' 
      ? mercadolibre.productos 
      : ebay.productos;
</script>

<div class="results-list">
  <!-- Tabs -->
  <div class="tabs is-boxed is-centered">
    <ul>
      <li class:is-active={activeTab === 'todos'}>
        <a href="#todos" on:click|preventDefault={() => activeTab = 'todos'}>
          <span class="icon is-small"><i class="fas fa-list"></i></span>
          <span>Todos ({todosLosProductos.length})</span>
        </a>
      </li>
      <li class:is-active={activeTab === 'mercadolibre'}>
        <a href="#mercadolibre" on:click|preventDefault={() => activeTab = 'mercadolibre'}>
          <span class="icon is-small"><i class="fas fa-store"></i></span>
          <span>MercadoLibre ({mercadolibre.total})</span>
        </a>
      </li>
      <li class:is-active={activeTab === 'ebay'}>
        <a href="#ebay" on:click|preventDefault={() => activeTab = 'ebay'}>
          <span class="icon is-small"><i class="fas fa-shopping-cart"></i></span>
          <span>eBay ({ebay.total})</span>
        </a>
      </li>
    </ul>
  </div>
  
  <!-- Stats -->
  <div class="columns is-mobile mb-4">
    <div class="column has-text-centered">
      <p class="heading">Coincidencias Exactas</p>
      <p class="title is-5">
        {activeTab === 'todos' 
          ? mercadolibre.coincidenciasExactas + ebay.coincidenciasExactas
          : activeTab === 'mercadolibre' 
            ? mercadolibre.coincidenciasExactas 
            : ebay.coincidenciasExactas}
      </p>
    </div>
    <div class="column has-text-centered">
      <p class="heading">Coincidencias Parciales</p>
      <p class="title is-5">
        {activeTab === 'todos' 
          ? mercadolibre.coincidenciasParciales + ebay.coincidenciasParciales
          : activeTab === 'mercadolibre' 
            ? mercadolibre.coincidenciasParciales 
            : ebay.coincidenciasParciales}
      </p>
    </div>
  </div>
  
  <!-- Tabla de resultados -->
  {#if productosAMostrar.length > 0}
    <div class="table-container">
      <table class="table is-fullwidth is-hoverable is-striped">
        <thead>
          <tr>
            <th class="has-text-centered" style="width: 60px;">#</th>
            <th>Producto</th>
            <th class="has-text-right" style="width: 180px;">Precio</th>
            <th class="has-text-centered" style="width: 80px;">Fuente</th>
            <th class="has-text-centered" style="width: 100px;">Accion</th>
          </tr>
        </thead>
        <tbody>
          {#each productosAMostrar as producto (producto.link)}
            <ProductCard {producto} />
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="notification is-warning has-text-centered">
      <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
      <span>No se encontraron resultados en esta fuente.</span>
    </div>
  {/if}
</div>

<style>
  .results-list {
    margin-top: 2rem;
  }
  
  .heading {
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--color-paragraph);
  }
  
  .table-container {
    overflow-x: auto;
    border: 2px solid var(--color-stroke);
    border-radius: 4px;
    background-color: #fff;
  }
  
  .tabs li.is-active a {
    border-bottom-color: var(--color-button);
    color: var(--color-button-text);
    background-color: var(--color-button);
  }

  .tabs a {
    border-color: var(--color-stroke);
    color: var(--color-paragraph);
    background-color: #fff;
  }

  .tabs a:hover {
    border-bottom-color: var(--color-button);
    color: var(--color-headline);
    background-color: var(--color-main);
  }
</style>
