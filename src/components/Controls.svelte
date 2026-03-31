<script lang="ts">
  import {
    undo,
    eraseCell,
    toggleNote,
    handleInput,
    remainingCounts,
    inputMode,
    notesMode,
    selectedCell,
    selectedNumber,
    history,
  } from "../lib/store";

  function onNumber(num: number) {
    handleInput(num);
  }

  function onErase() {
    if ($selectedCell !== null) {
      eraseCell($selectedCell);
    }
  }

  function toggleMode() {
    $inputMode = $inputMode === "cell" ? "number" : "cell";
    $selectedCell = null;
    $selectedNumber = null;
  }

  const NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<div class="controls-container">
  <!-- Action Bar -->
  <div class="action-bar">
    <button class="action-btn" disabled={$history.length === 0} on:click={undo}>
      <span class="icon">↶</span>
      <span class="label">Undo</span>
    </button>
    <button
      class="action-btn"
      disabled={$selectedCell === null}
      on:click={onErase}
    >
      <span class="icon">⌫</span>
      <span class="label">Erase</span>
    </button>
    <button
      class="action-btn"
      class:active={$notesMode}
      on:click={() => ($notesMode = !$notesMode)}
    >
      <span class="icon">✎</span>
      <span class="label">Notes: {$notesMode ? "On" : "Off"}</span>
    </button>
    <button class="action-btn highlight" on:click={toggleMode}>
      <span class="icon">{$inputMode === "cell" ? "🔲" : "1️⃣"}</span>
      <span class="label"
        >Mode: {$inputMode === "cell" ? "Cell" : "Number"}</span
      >
    </button>
  </div>

  <!-- Number Pad -->
  <div class="numpad">
    {#each NUMBERS as n}
      <button
        class="num-btn"
        class:dimmed={$remainingCounts[n] <= 0}
        class:selected={$inputMode === "number" && $selectedNumber === n}
        on:click={() => onNumber(n)}
      >
        {n}
      </button>
    {/each}
  </div>
</div>

<style>
  .controls-container {
    margin-top: auto; /* push to bottom */
    width: 100%;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Action Bar */
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
    gap: 0.5rem;
  }

  .action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-main);
    gap: 0.3rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition:
      background-color 0.2s,
      opacity 0.2s;
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .action-btn .icon {
    font-size: 1.5rem;
  }

  .action-btn .label {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .action-btn.active {
    background-color: var(--primary-light);
    color: var(--primary);
  }

  .action-btn.highlight {
    background-color: #f1f2f6;
  }

  /* Numpad */
  .numpad {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    max-width: 320px;
    margin: 0 auto;
    width: 100%;
  }

  .num-btn {
    flex: 0 0 calc(20% - 0.4rem); /* 5 buttons per row */
    background-color: var(--surface-color);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    font-size: clamp(1.4rem, 5vw, 1.8rem);
    font-weight: 500;
    color: var(--primary);
    aspect-ratio: 1; /* perfect square touch targets */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .num-btn:active {
    transform: scale(0.95);
    background-color: var(--primary-light);
  }

  .num-btn.dimmed {
    opacity: 0.2;
    pointer-events: none; /* optional: could allow clicking anyway */
  }

  .num-btn.selected {
    background-color: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  @media (orientation: landscape) and (max-height: 800px) {
    .controls-container {
      margin-top: 0;
      justify-content: center;
      height: 100%;
    }
    
    .action-bar {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.8rem;
    }
    
    .action-btn {
      padding: 0.8rem;
    }
  }
</style>
