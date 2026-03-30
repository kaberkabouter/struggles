<script lang="ts">
  import { onMount } from 'svelte';
  import Board from './components/Board.svelte';
  import Controls from './components/Controls.svelte';
  import { loadFromLocalStorage, startNewGame } from './lib/store';
  import './app.css';

  onMount(() => {
    // Try restoring state from localStorage
    const didLoad = loadFromLocalStorage();
    if (!didLoad) {
      // If none, start a new game (default difficulty 40 holes)
      startNewGame(40);
    }
  });

  function resetGame() {
    if (confirm("Are you sure you want to start a new game?")) {
      startNewGame();
    }
  }
</script>

<main id="app">
  <header>
    <h1>Sudoku</h1>
    <button class="new-game-btn" on:click={resetGame}>New Game</button>
  </header>
  
  <div class="content">
    <Board />
  </div>

  <Controls />
</main>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .new-game-btn {
    padding: 0.5rem 1rem;
    background-color: var(--primary);
    color: white;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
  }
</style>
