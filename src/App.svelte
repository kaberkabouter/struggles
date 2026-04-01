<script lang="ts">
  import { onMount } from 'svelte';
  import Board from './components/Board.svelte';
  import Controls from './components/Controls.svelte';
  import NewGameModal from './components/NewGameModal.svelte';
  import VictoryPanel from './components/VictoryPanel.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import { game, loadFromLocalStorage, startNewGame } from './lib/gameState.svelte';
  import './app.css';

  // Local state
  let showNewGameModal = $state(false);
  let validateState = $state<'idle' | 'valid' | 'invalid'>('idle');
  let validateTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    const loaded = loadFromLocalStorage();
    if (!loaded) startNewGame(40);
  });

  function handleNewGame() {
    showNewGameModal = true;
  }

  function handleStart(holes: number) {
    startNewGame(holes);
    showNewGameModal = false;
  }

  function handleRestart() {
    showNewGameModal = true;
  }

  // Feature 1 — Validate board: flash green (no conflicts) or red (conflicts found)
  function validate() {
    if (validateTimer) clearTimeout(validateTimer);
    validateState = game.conflicts.size === 0 ? 'valid' : 'invalid';
    validateTimer = setTimeout(() => { validateState = 'idle'; }, 1400);
  }
</script>

<main id="app">
  <!-- ── Header ───────────────────────────────────────────────── -->
  <header>
    <h1 class="zen-title">禅</h1>

    <div class="header-actions">
      <button
        class="validate-btn"
        class:flash-valid={validateState === 'valid'}
        class:flash-invalid={validateState === 'invalid'}
        onclick={validate}
        aria-label="Validate board"
      >
        {#if validateState === 'valid'}✓ Valid{:else if validateState === 'invalid'}✗ Errors{:else}Validate{/if}
      </button>

      <button class="new-game-btn" onclick={handleNewGame}>New Game</button>

      <ThemeToggle />
    </div>
  </header>

  <!-- ── Board Area ────────────────────────────────────────────── -->
  <div class="board-area">
    <Board {validateState} />
  </div>

  <!-- ── Bottom Controls (no numpad) ──────────────────────────── -->
  {#if !game.isGameWon}
    <Controls />
  {:else}
    <VictoryPanel onrestart={handleRestart} />
  {/if}
</main>

{#if showNewGameModal}
  <NewGameModal
    onstart={handleStart}
    onclose={() => (showNewGameModal = false)}
  />
{/if}

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    height: var(--header-height);
    padding: 0 0.25rem;
  }

  .zen-title {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--text-muted);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .validate-btn,
  .new-game-btn {
    padding: 0.4rem 0.85rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .validate-btn {
    background-color: var(--surface-raised);
    color: var(--text-muted);
    border: 1px solid var(--border-light);
  }

  .validate-btn.flash-valid {
    background-color: rgba(63, 185, 80, 0.2);
    color: var(--flash-valid);
    border-color: var(--flash-valid);
    animation: btn-pulse 0.4s ease;
  }

  .validate-btn.flash-invalid {
    background-color: rgba(248, 81, 73, 0.2);
    color: var(--flash-invalid);
    border-color: var(--flash-invalid);
    animation: btn-shake 0.4s ease;
  }

  @keyframes btn-pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }

  @keyframes btn-shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-3px); }
    75%       { transform: translateX(3px); }
  }

  .new-game-btn {
    background-color: var(--primary);
    color: var(--bg-color);
  }

  .new-game-btn:hover {
    opacity: 0.88;
  }

  .board-area {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }
</style>
