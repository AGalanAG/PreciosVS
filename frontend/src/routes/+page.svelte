<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import PriceSummary from '$lib/components/PriceSummary.svelte';
  import ResultsList from '$lib/components/ResultsList.svelte';
  import { buscarProducto, type BusquedaResponse } from '$lib/services/api';
  
  let isLoading = $state(false);
  let resultado: BusquedaResponse | null = $state(null);
  let error: string | null = $state(null);
  let searchedProduct: string = $state('');
  let isFlexibleSearch = $state(false);
  
  async function handleSearch(event: CustomEvent<{ query: string; flexible: boolean }>) {
    const { query, flexible } = event.detail;
    isLoading = true;
    error = null;
    resultado = null;
    searchedProduct = query;
    isFlexibleSearch = flexible;
    
    try {
      resultado = await buscarProducto(query, flexible);
      if (!resultado.exito) {
        error = resultado.error || 'Error desconocido en la busqueda';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al conectar con el servidor';
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="section">
  <div class="container">
    <!-- Header -->
    <div class="has-text-centered mb-6">
      <h1 class="title is-2">
        <span class="icon-text">
          <span class="icon has-text-primary">
            <i class="fas fa-balance-scale"></i>
          </span>
          <span>Comparador de Precios</span>
        </span>
      </h1>
      <p class="subtitle is-5 has-text-grey">
        Busca productos en MercadoLibre y eBay para encontrar el mejor precio
      </p>
    </div>
    
    <!-- Barra de busqueda -->
    <SearchBar {isLoading} on:search={handleSearch} />
    
    <!-- Estado de carga -->
    {#if isLoading}
      <div class="has-text-centered mt-6">
        <div class="box">
          <p class="mb-4">
            <span class="icon is-large">
              <i class="fas fa-spinner fa-pulse fa-2x"></i>
            </span>
          </p>
          <p class="title is-5">Buscando "{searchedProduct}"...</p>
          <p class="subtitle is-6 has-text-grey">
            Consultando MercadoLibre y eBay. Esto puede tomar unos segundos.
          </p>
          <progress class="progress is-primary" max="100"></progress>
        </div>
      </div>
    {/if}
    
    <!-- Error -->
    {#if error && !isLoading}
      <div class="notification is-danger mt-5">
        <button class="delete" on:click={() => error = null}></button>
        <p class="has-text-weight-bold">
          <span class="icon"><i class="fas fa-exclamation-circle"></i></span>
          Error en la busqueda
        </p>
        <p>{error}</p>
      </div>
    {/if}
    
    <!-- Resultados -->
    {#if resultado && resultado.exito && !isLoading}
      <div class="mt-5">
        <!-- Indicador de modo de búsqueda -->
        {#if isFlexibleSearch}
          <div class="notification is-warning is-light mb-4">
            <span class="icon"><i class="fas fa-filter-circle-xmark"></i></span>
            <strong>Búsqueda flexible activa:</strong> Mostrando más resultados con criterios menos restrictivos. Pueden incluirse productos con variaciones en el nombre.
          </div>
        {/if}
        
        <!-- Cache indicator -->
        {#if resultado._cache?.hit}
          <div class="notification is-light is-small mb-4">
            <span class="icon"><i class="fas fa-bolt"></i></span>
            <span class="is-size-7">Resultados desde cache (expira en {Math.round((resultado._cache.ttlRemaining || 0) / 1000)}s)</span>
          </div>
        {/if}
        
        <!-- Resumen de precios -->
        <PriceSummary analisis={resultado.analisis} />
        
        <!-- Lista de resultados -->
        <ResultsList 
          mercadolibre={resultado.resultados.mercadolibre} 
          ebay={resultado.resultados.ebay} 
        />
        
        <!-- Timestamp -->
        <p class="has-text-centered has-text-grey is-size-7 mt-4">
          Busqueda realizada: {new Date(resultado.timestamp).toLocaleString('es-MX')}
        </p>
      </div>
    {/if}
    
    <!-- Estado inicial -->
    {#if !resultado && !isLoading && !error}
      <div class="has-text-centered mt-6">
        <div class="box">
          <span class="icon is-large has-text-grey-light">
            <i class="fas fa-search fa-3x"></i>
          </span>
          <p class="title is-5 mt-4 has-text-grey">Ingresa un producto para comenzar</p>
          <p class="subtitle is-6 has-text-grey-light">
            Escribe el nombre o numero de serie del producto que deseas comparar
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="content has-text-centered">
    <p class="footer-title">
      <strong>Comparador de Precios</strong> - MercadoLibre y eBay
    </p>
    <p class="footer-text">
      Los precios mostrados son aproximados y pueden variar.
    </p>
  </div>
</footer>

<style>
  .section {
    padding-top: 3rem;
    min-height: calc(100vh - 120px);
  }
  
  .footer {
    padding: 1.5rem;
    background-color: #fff;
    border-top: 3px solid var(--color-stroke);
    box-shadow: 0 -2px 0 var(--color-stroke);
  }

  .footer-title {
    color: var(--color-headline);
    margin-bottom: 0.5rem;
  }

  .footer-title strong {
    color: var(--color-headline);
    font-weight: 700;
  }

  .footer-text {
    color: var(--color-paragraph);
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  .progress {
    height: 0.5rem;
  }
</style>
