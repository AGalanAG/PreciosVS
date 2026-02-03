<script lang="ts">
  import 'bulma/css/bulma.min.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Comparador de Precios</title>
</svelte:head>

{@render children()}

<style>
  :global(:root) {
    /* Paleta de colores personalizada */
    --color-background: #fef6e4;
    --color-headline: #001858;
    --color-paragraph: #172c66;
    --color-button: #f582ae;
    --color-button-text: #001858;
    --color-stroke: #001858;
    --color-main: #f3d2c1;
    --color-highlight: #fef6e4;
    --color-secondary: #8bd3dd;
    --color-tertiary: #f582ae;
  }

  :global(body) {
    min-height: 100vh;
    background-color: var(--color-background);
    color: var(--color-paragraph);
  }
  
  :global(.notification.is-small) {
    padding: 0.75rem 1rem;
  }

  :global(h1), :global(h2), :global(h3), :global(h4), :global(h5), :global(h6),
  :global(.title) {
    color: var(--color-headline) !important;
  }

  :global(p), :global(.subtitle) {
    color: var(--color-paragraph) !important;
  }

  :global(.button.is-primary) {
    background-color: var(--color-button) !important;
    border-color: var(--color-button) !important;
    color: var(--color-button-text) !important;
  }

  :global(.button.is-primary:hover) {
    background-color: #e06595 !important;
    border-color: #e06595 !important;
  }

  :global(.button.is-primary.is-outlined) {
    background-color: transparent !important;
    border-color: var(--color-button) !important;
    color: var(--color-button) !important;
  }

  :global(.button.is-primary.is-outlined:hover) {
    background-color: var(--color-button) !important;
    color: var(--color-button-text) !important;
  }

  :global(.has-text-primary) {
    color: var(--color-button) !important;
  }

  :global(.has-background-primary-light) {
    background-color: var(--color-main) !important;
  }

  :global(.progress.is-primary::-webkit-progress-value) {
    background-color: var(--color-button) !important;
  }

  :global(.progress.is-primary::-moz-progress-bar) {
    background-color: var(--color-button) !important;
  }

  :global(.progress.is-primary) {
    background-color: var(--color-main);
  }

  :global(.box) {
    background-color: #fff;
    border: 2px solid var(--color-stroke);
    box-shadow: 4px 4px 0 var(--color-stroke);
  }

  :global(.input), :global(.select select), :global(.textarea) {
    border-color: var(--color-stroke);
    color: var(--color-paragraph);
  }

  :global(.input:focus), :global(.select select:focus), :global(.textarea:focus) {
    border-color: var(--color-button);
    box-shadow: 0 0 0 2px rgba(245, 130, 174, 0.25);
  }

  :global(.tabs.is-boxed li.is-active a) {
    background-color: var(--color-button) !important;
    border-color: var(--color-stroke) !important;
    color: var(--color-button-text) !important;
  }

  :global(.tabs.is-boxed a) {
    border-color: var(--color-stroke);
    color: var(--color-paragraph);
  }

  :global(.tabs.is-boxed a:hover) {
    background-color: var(--color-main);
  }

  :global(.table) {
    background-color: #fff;
  }

  :global(.table th) {
    background-color: var(--color-headline) !important;
    color: #fff !important;
    border-color: var(--color-stroke) !important;
  }

  :global(.table td) {
    border-color: var(--color-stroke) !important;
    background-color: #fff;
  }

  :global(.table.is-striped tbody tr:not(.is-selected):nth-child(even)) {
    background-color: var(--color-highlight) !important;
  }

  :global(.table.is-striped tbody tr:not(.is-selected):nth-child(odd)) {
    background-color: #fff !important;
  }

  :global(.table.is-hoverable tbody tr:not(.is-selected):hover) {
    background-color: var(--color-main) !important;
  }

  :global(.tag.is-primary.is-light) {
    background-color: var(--color-main) !important;
    color: var(--color-headline) !important;
  }

  :global(.tag.is-link) {
    background-color: var(--color-secondary) !important;
    color: var(--color-headline) !important;
  }

  :global(.tag.is-warning) {
    background-color: var(--color-main) !important;
    color: var(--color-headline) !important;
  }

  :global(.tag.is-success.is-light) {
    background-color: var(--color-secondary) !important;
    color: var(--color-headline) !important;
  }

  :global(.tag.is-warning.is-light) {
    background-color: var(--color-main) !important;
    color: var(--color-headline) !important;
  }

  :global(.notification) {
    border: 2px solid var(--color-stroke);
  }

  :global(.notification.is-danger) {
    background-color: #ffebe9;
    color: var(--color-headline);
  }

  :global(.notification.is-warning) {
    background-color: var(--color-main);
    color: var(--color-headline);
  }

  :global(.notification.is-light) {
    background-color: var(--color-highlight);
    border-color: var(--color-secondary);
  }

  :global(.icon.has-text-grey-light) {
    color: var(--color-main) !important;
  }

  :global(.has-text-grey), :global(.has-text-grey-light) {
    color: var(--color-paragraph) !important;
    opacity: 0.7;
  }
</style>
