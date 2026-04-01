<script lang="ts">
  import { game, undo, eraseCell } from '../lib/gameState.svelte';
</script>

<!-- Minimal action strip — no number pad (replaced by radial menu) -->
<div class="controls-strip">
  <button
    class="action-btn"
    disabled={game.history.length === 0}
    onclick={undo}
    aria-label="Undo"
  >
    <span class="icon">↶</span>
    <span class="label">Undo</span>
  </button>

  <button
    class="action-btn"
    disabled={game.selectedCell === null}
    onclick={() => game.selectedCell !== null && eraseCell(game.selectedCell)}
    aria-label="Erase"
  >
    <span class="icon">⌫</span>
    <span class="label">Erase</span>
  </button>

  <button
    class="action-btn"
    class:active={game.notesMode}
    onclick={() => (game.notesMode = !game.notesMode)}
    aria-label="Toggle notes"
  >
    <span class="icon">✎</span>
    <span class="label">Notes {game.notesMode ? 'On' : 'Off'}</span>
  </button>
</div>

<style>
  .controls-strip {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    flex-shrink: 0;
  }

  .action-btn {
    flex: 1;
    max-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    color: var(--text-muted);
    background-color: var(--surface-raised);
    border: 1px solid var(--border-light);
    transition: all 0.15s ease;
  }

  .action-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .action-btn:not(:disabled):hover {
    color: var(--text-main);
    border-color: var(--primary);
  }

  .action-btn.active {
    background-color: var(--primary-light);
    color: var(--primary);
    border-color: var(--primary);
  }

  .icon  { font-size: 1.3rem; line-height: 1; }
  .label { font-size: 0.68rem; font-weight: 600; }
</style>
