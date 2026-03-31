<script lang="ts">
  import { grid, selectedCell, selectedNumber, conflicts, BLANK } from '../lib/store';
  import { getRelatedIndices } from '../lib/sudoku';
  import Cell from './Cell.svelte';

  $: activeValue = getActiveValue($selectedCell, $selectedNumber, $grid);
  $: relatedIndices = $selectedCell !== null ? new Set(getRelatedIndices($selectedCell)) : new Set();
  
  function getActiveValue(sc: number | null, sn: number | null, g: typeof $grid) {
    if (sc !== null && g[sc] && g[sc].value !== BLANK) {
      return g[sc].value;
    }
    return sn;
  }
</script>

<div class="board-container">
  <div class="board">
    {#each $grid as cell}
      <div class="cell-wrapper" 
        class:border-right={cell.index % 9 === 2 || cell.index % 9 === 5}
        class:border-bottom={Math.floor(cell.index / 9) === 2 || Math.floor(cell.index / 9) === 5}
      >
        <Cell 
          {cell}
          isSelected={$selectedCell === cell.index}
          isRelated={$selectedCell !== null && relatedIndices.has(cell.index)}
          isHighlightedNumber={activeValue !== null && activeValue === cell.value}
          hasConflict={$conflicts.has(cell.index)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .board-container {
    width: 100%;
    max-width: var(--max-width);
    aspect-ratio: 1;
    margin: 0 auto;
    padding: 2px;
    background-color: var(--border-dark);
    box-sizing: border-box;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    width: 100%;
    height: 100%;
    gap: 1px; /* Light inner borders */
    background-color: var(--border-light);
  }

  .cell-wrapper {
    background-color: var(--surface-color);
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  /* Thicker borders for 3x3 grids */
  .cell-wrapper.border-right {
    border-right: 2px solid var(--border-dark);
  }

  .cell-wrapper.border-bottom {
    border-bottom: 2px solid var(--border-dark);
  }
</style>
