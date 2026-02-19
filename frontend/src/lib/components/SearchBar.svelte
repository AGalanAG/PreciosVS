<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let { isLoading = false }: { isLoading?: boolean } = $props();
  
  let query = $state('');
  let flexible = $state(false);
  
  function handleSearch() {
    if (!query.trim() || isLoading) return;
    dispatch('search', { query: query.trim(), flexible });
  }
  
  function handleKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
  
  function toggleFlexible() {
    flexible = !flexible;
    // Si ya hay una búsqueda, repetirla con el nuevo modo
    if (query.trim() && !isLoading) {
      handleSearch();
    }
  }
</script>

<div class="search-container">
  <div class="field has-addons has-addons-centered">
    <div class="control is-expanded has-icons-left">
      <input 
        class="input is-medium" 
        type="text" 
        placeholder="Buscar producto por nombre o numero de serie..."
        bind:value={query}
        onkeypress={handleKeypress}
        disabled={isLoading}
      />
      <span class="icon is-left">
        <i class="fas fa-search"></i>
      </span>
    </div>
    <div class="control">
      <button 
        class="button is-primary is-medium"
        class:is-loading={isLoading}
        onclick={handleSearch}
        disabled={isLoading || !query.trim()}
      >
        <span class="icon">
          <i class="fas fa-search"></i>
        </span>
        <span>Buscar</span>
      </button>
    </div>
  </div>
  
  <!-- Toggle de búsqueda flexible -->
  <div class="flexible-toggle-container">
    <button 
      class="button is-rounded flexible-toggle" 
      class:is-active={flexible}
      onclick={toggleFlexible}
      disabled={isLoading}
      title={flexible ? 'Búsqueda flexible: Mostrando más resultados con menos restricciones' : 'Búsqueda estricta: Resultados más precisos'}
    >
      <span class="icon">
        <i class="fas {flexible ? 'fa-filter-circle-xmark' : 'fa-filter'}"></i>
      </span>
      <span class="toggle-text">
        {flexible ? 'Búsqueda Flexible' : 'Búsqueda Estricta'}
      </span>
      {#if flexible}
        <span class="tag is-warning is-light ml-2">Más resultados</span>
      {:else}
        <span class="tag is-info is-light ml-2">Precisa</span>
      {/if}
    </button>
    <p class="help has-text-centered mt-2">
      {#if flexible}
        <span class="has-text-warning"><i class="fas fa-circle-info"></i> Mostrando más productos con criterios flexibles</span>
      {:else}
        <span class="has-text-grey">Activa búsqueda flexible para ver más resultados</span>
      {/if}
    </p>
  </div>
</div>

<style>
  .search-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .input {
    border-radius: 4px 0 0 4px;
    border: 2px solid var(--color-stroke);
    border-right: none;
    background-color: #fff;
  }

  .input:focus {
    border-color: var(--color-button);
    box-shadow: none;
    background-color: #fff;
  }

  .input::placeholder {
    color: var(--color-paragraph);
    opacity: 0.5;
  }
  
  .button {
    border-radius: 0 4px 4px 0;
    border: 2px solid var(--color-stroke);
    font-weight: 600;
  }
  
  .flexible-toggle-container {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .flexible-toggle {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #dbdbdb;
    background-color: white;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .flexible-toggle:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #3273dc;
  }
  
  .flexible-toggle.is-active {
    background-color: #ffdd57;
    border-color: #ffd83d;
    color: rgba(0,0,0,0.87);
    font-weight: 600;
  }
  
  .flexible-toggle.is-active:hover:not(:disabled) {
    background-color: #ffd83d;
  }
  
  .toggle-text {
    font-weight: 600;
    margin: 0 0.5rem;
  }
  
  .help {
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
</style>
