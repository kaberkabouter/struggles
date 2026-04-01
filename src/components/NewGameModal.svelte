<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  interface Props {
    onstart: (holes: number) => void;
    onclose: () => void;
  }

  let { onstart, onclose }: Props = $props();

  const difficulties = [
    { name: 'Testing',  holes: 1,  color: '#9E9E9E' },
    { name: 'Easy',     holes: 30, color: '#4CAF50' },
    { name: 'Medium',   holes: 40, color: '#FF9800' },
    { name: 'Hard',     holes: 50, color: '#F44336' },
    { name: 'Expert',   holes: 58, color: '#9C27B0' },
  ];

  onMount(() => {
    if (typeof document !== 'undefined') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="backdrop" transition:fade={{ duration: 200 }} onclick={onclose}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal" transition:scale={{ duration: 250, start: 0.95 }} onclick={(e) => e.stopPropagation()}>
    <h2>New Game</h2>
    <p>Choose a difficulty. Your current progress will be lost.</p>

    <div class="difficulty-grid">
      {#each difficulties as diff}
        <button
          class="diff-btn"
          style="--hover-color:{diff.color}22; --border-color:{diff.color}"
          onclick={() => onstart(diff.holes)}
        >
          <span class="diff-name">{diff.name}</span>
          <span class="diff-desc">{81 - diff.holes} givens</span>
        </button>
      {/each}
    </div>

    <button class="cancel-btn" onclick={onclose}>Cancel</button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    box-sizing: border-box;
  }

  .modal {
    background-color: var(--surface-raised);
    border-radius: 20px;
    padding: 1.75rem 1.5rem;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 1px solid var(--border-light);
  }

  h2 { margin: 0 0 0.4rem; font-size: 1.4rem; color: var(--text-main); }
  p  { margin: 0 0 1.5rem; font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; }

  .difficulty-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    width: 100%;
    margin-bottom: 1.25rem;
  }

  .diff-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0.5rem;
    border: 2px solid var(--border-light);
    border-radius: 12px;
    background: transparent;
    transition: all 0.2s ease;
  }

  .diff-btn:hover, .diff-btn:active {
    border-color: var(--border-color);
    background-color: var(--hover-color);
    transform: translateY(-2px);
  }

  .diff-name { font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.2rem; }
  .diff-desc { font-size: 0.72rem; color: var(--text-muted); }

  .cancel-btn {
    width: 100%;
    padding: 0.85rem;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-muted);
    background-color: var(--highlight-bg);
    border-radius: 12px;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover { background-color: var(--border-light); color: var(--text-main); }
</style>
