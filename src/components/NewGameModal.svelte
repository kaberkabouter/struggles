<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();
  
  const difficulties = [
    { name: 'Testing', holes: 1, color: '#9E9E9E' },
    { name: 'Easy', holes: 30, color: '#4CAF50' },
    { name: 'Medium', holes: 40, color: '#FF9800' },
    { name: 'Hard', holes: 50, color: '#F44336' },
    { name: 'Expert', holes: 58, color: '#9C27B0' }
  ];

  function start(holes: number) {
    dispatch('start', holes);
  }

  function close() {
    dispatch('close');
  }

  // Prevent background scrolling while modal is open
  onMount(() => {
    if (typeof document !== 'undefined') {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="backdrop" transition:fade={{ duration: 200 }} on:click={close}>
  <div class="modal" transition:scale={{ duration: 250, start: 0.95 }} on:click|stopPropagation>
    <h2>New Game</h2>
    <p>Select a difficulty. Your current game progress will be lost.</p>
    
    <div class="difficulty-grid">
      {#each difficulties as diff}
        <button 
          class="diff-btn" 
          style="--hover-color: {diff.color}22; --border-color: {diff.color}"
          on:click={() => start(diff.holes)}
        >
          <span class="diff-name">{diff.name}</span>
          <span class="diff-desc">{81 - diff.holes} givens</span>
        </button>
      {/each}
    </div>

    <button class="cancel-btn" on:click={close}>Cancel</button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    box-sizing: border-box;
  }

  .modal {
    background-color: var(--surface-color, #ffffff);
    border-radius: 16px;
    padding: 1.5rem;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    color: var(--text-main, #2d2d3a);
  }

  p {
    margin: 0 0 1.5rem 0;
    font-size: 0.9rem;
    color: var(--text-muted, #8e8e9e);
    line-height: 1.4;
  }

  .difficulty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .diff-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 0.5rem;
    border: 2px solid var(--border-light, #e5e5ea);
    border-radius: 12px;
    background-color: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    touch-action: manipulation;
  }

  .diff-btn:hover, .diff-btn:active {
    border-color: var(--border-color);
    background-color: var(--hover-color);
    transform: translateY(-2px);
  }

  .diff-btn:active {
    transform: translateY(0);
  }

  .diff-name {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-main, #2d2d3a);
    margin-bottom: 0.25rem;
  }

  .diff-desc {
    font-size: 0.75rem;
    color: var(--text-muted, #8e8e9e);
  }

  .cancel-btn {
    width: 100%;
    padding: 0.8rem;
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-muted, #8e8e9e);
    background-color: var(--bg-color, #f9f9fb);
    border: none;
    border-radius: 12px;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover, .cancel-btn:active {
    background-color: var(--border-light, #e5e5ea);
    color: var(--text-main, #2d2d3a);
  }
</style>
