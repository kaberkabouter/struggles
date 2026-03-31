<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  function restart() {
    dispatch('restart');
  }
</script>

<div class="victory-panel" transition:slide={{ duration: 400 }}>
  <h2>Victory!</h2>
  <p>You have successfully completed this puzzle.</p>
  <button class="restart-btn" on:click={restart}>Play Again</button>
</div>

<style>
  .victory-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    border-radius: 16px;
    margin-top: auto;
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
    text-align: center;
    width: 100%;
    box-sizing: border-box;
    max-width: var(--max-width);
    margin-left: auto;
    margin-right: auto;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
  }

  p {
    margin: 0 0 1.5rem 0;
    opacity: 0.9;
  }

  .restart-btn {
    background-color: white;
    color: #2E7D32;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .restart-btn:hover, .restart-btn:active {
    transform: scale(1.05);
  }
</style>
