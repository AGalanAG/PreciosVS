<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let query = '';
  export let isLoading = false;
  
  function handleSearch() {
    if (!query.trim() || isLoading) return;
    dispatch('search', { query: query.trim() });
  }
  
  function handleKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
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
        on:keypress={handleKeypress}
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
        on:click={handleSearch}
        disabled={isLoading || !query.trim()}
      >
        <span class="icon">
          <i class="fas fa-search"></i>
        </span>
        <span>Buscar</span>
      </button>
    </div>
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
</style>
