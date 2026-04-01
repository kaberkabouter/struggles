<script lang="ts">
  import type { SudokuCell } from '../lib/gameState.svelte';
  import { BLANK } from '../lib/gameState.svelte';

  interface Props {
    cell: SudokuCell;
    isSelected?: boolean;
    isRelated?: boolean;
    isHighlightedNumber?: boolean;
    hasConflict?: boolean;
    isRadialOpen?: boolean;
    validateState?: 'idle' | 'valid' | 'invalid';
  }

  let {
    cell,
    isSelected      = false,
    isRelated       = false,
    isHighlightedNumber = false,
    hasConflict     = false,
    isRadialOpen    = false,
    validateState   = 'idle',
  }: Props = $props();

  const isFixed  = $derived(cell.isFixed);
  const hasValue = $derived(cell.value !== BLANK);

  // Validate flash states per cell
  const isFlashValid   = $derived(validateState === 'valid'   && !hasConflict && hasValue);
  const isFlashInvalid = $derived(validateState === 'invalid' && hasConflict);
</script>

<div
  class="cell"
  class:fixed={isFixed}
  class:player={!isFixed}
  class:selected={isSelected}
  class:related={!isSelected && isRelated}
  class:highlighted-num={!isSelected && !isRelated && isHighlightedNumber}
  class:conflict={hasConflict && validateState === 'idle'}
  class:flash-valid={isFlashValid}
  class:flash-invalid={isFlashInvalid}
  class:radial-open={isRadialOpen}
>
  {#if hasValue}
    <span class="value">{cell.value}</span>
  {:else if cell.notes && cell.notes.length > 0}
    <div class="notes-grid">
      {#each [1,2,3,4,5,6,7,8,9] as n}
        <span class="note {cell.notes.includes(n) ? 'active' : ''}">{cell.notes.includes(n) ? n : ''}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .cell {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(1.1rem, 4.5vw, 1.9rem);
    font-weight: 500;
    cursor: pointer;
    background-color: var(--surface-color);
    box-sizing: border-box;
    position: relative;
    transition: background-color 0.12s ease, color 0.12s ease;
  }

  .value { pointer-events: none; }

  .fixed  { color: var(--fixed-text);  font-weight: 700; }
  .player { color: var(--player-text); font-weight: 500; }

  .selected       { background-color: var(--primary-light); }
  .related        { background-color: var(--highlight-bg); }
  .highlighted-num{ background-color: var(--highlight-same); }
  .conflict       { background-color: var(--error-bg); color: var(--error); }

  /* Radial menu open indicator — pulsing ring */
  .radial-open {
    box-shadow: inset 0 0 0 2px var(--primary);
    background-color: var(--primary-light);
    animation: radial-ring-pulse 1.2s ease-in-out infinite;
  }

  @keyframes radial-ring-pulse {
    0%, 100% { box-shadow: inset 0 0 0 2px var(--primary); }
    50%       { box-shadow: inset 0 0 0 2px var(--primary), 0 0 8px var(--primary); }
  }

  /* Validate flash */
  .flash-valid {
    animation: cell-flash-valid 1.2s ease forwards;
  }
  .flash-invalid {
    animation: cell-flash-invalid 1.2s ease forwards;
  }

  /* Notes */
  .notes-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    padding: 2px;
    box-sizing: border-box;
    pointer-events: none;
  }
  .note {
    font-size: clamp(0.38rem, 1.8vw, 0.65rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
  .note.active { color: var(--accent-notes); font-weight: 600; }
</style>
