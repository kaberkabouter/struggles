<script lang="ts">
  import { onMount } from 'svelte';
  import Board from './components/Board.svelte';
  import Controls from './components/Controls.svelte';
  import NewGameModal from './components/NewGameModal.svelte';
  import VictoryPanel from './components/VictoryPanel.svelte';
  import { loadFromLocalStorage, startNewGame, isGameWon } from './lib/store';
  import './app.css';

  let showNewGameModal = false;

  onMount(() => {
    // Try restoring state from localStorage
    const didLoad = loadFromLocalStorage();
    if (!didLoad) {
      // If none, start a new game (default difficulty 40 holes)
      startNewGame(40);
    }
  });

  function resetGame() {
    showNewGameModal = true;
  }

  function handleStart(event: CustomEvent<number>) {
    startNewGame(event.detail);
    showNewGameModal = false;
  }
</script>

<main id="app">
  <header>
    <h1>Sudoku</h1>
    <button class="new-game-btn" on:click={resetGame}>New Game</button>
  </header>
  
  <div class="game-area">
    <div class="content">
      <Board />
    </div>

    <div class="side-panel">
      {#if $isGameWon}
        <VictoryPanel on:restart={resetGame} />
      {:else}
        <Controls />
      {/if}
    </div>
  </div>
</main>

{#if showNewGameModal}
  <NewGameModal 
    on:start={handleStart} 
    on:close={() => showNewGameModal = false} 
  />
{/if}

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

  .game-area {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    gap: 1.5rem;
  }

  .content {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: auto;
  }

  @media (orientation: landscape) and (max-height: 800px) {
    .game-area {
      flex-direction: row;
      align-items: center;
      justify-content: space-evenly;
      gap: 2rem;
    }
    
    .content {
      flex: 1 1 auto;
      justify-content: flex-start;
    }
    
    .side-panel {
      flex: 0 0 320px;
      margin-top: 0;
    }
  }
</style>
