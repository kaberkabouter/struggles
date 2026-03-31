<script lang="ts">
  import {
    grid,
    selectedCell,
    selectedNumber,
    conflicts,
    isGameWon,
    BLANK,
  } from "../lib/store";
  import { getRelatedIndices } from "../lib/sudoku";
  import Cell from "./Cell.svelte";

  $: activeValue = getActiveValue($selectedCell, $selectedNumber, $grid);
  $: relatedIndices =
    $selectedCell !== null
      ? new Set(getRelatedIndices($selectedCell))
      : new Set();

  function getActiveValue(
    sc: number | null,
    sn: number | null,
    g: typeof $grid,
  ) {
    if (sc !== null && g[sc] && g[sc].value !== BLANK) {
      return g[sc].value;
    }
    return sn;
  }

  function calcIndex(blockIndex: number, cellOffset: number): number {
    const startRow = Math.floor(blockIndex / 3) * 3;
    const startCol = (blockIndex % 3) * 3;
    const rowOffset = Math.floor(cellOffset / 3);
    const colOffset = cellOffset % 3;
    return (startRow + rowOffset) * 9 + (startCol + colOffset);
  }

  const BLOCKS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const CELLS_PER_BLOCK = [0, 1, 2, 3, 4, 5, 6, 7, 8];
</script>

<div class="board-container" class:victory={$isGameWon}>
  <div class="islands-board">
    {#each BLOCKS as blockIndex}
      <div class="island">
        {#each CELLS_PER_BLOCK as cellOffset}
          {@const idx = calcIndex(blockIndex, cellOffset)}
          {@const cell = $grid[idx]}
          {#if cell}
            <div class="cell-wrapper">
              <Cell
                {cell}
                isSelected={$selectedCell === cell.index}
                isRelated={$selectedCell !== null && relatedIndices.has(cell.index)}
                isHighlightedNumber={activeValue !== null && activeValue === cell.value}
                hasConflict={$conflicts.has(cell.index)}
              />
            </div>
          {/if}
        {/each}
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
    box-sizing: border-box;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @media (orientation: landscape) and (max-height: 800px) {
    .board-container {
      width: calc(100vh - 8rem);
      max-width: 100%;
    }
  }

  .board-container.victory {
    box-shadow: 0 0 25px rgba(76, 175, 80, 0.4);
    transform: scale(1.02);
  }

  .islands-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    gap: var(--island-gap);
  }

  .island {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 1px; /* Inner cell borders */
    background-color: var(--border-light);
    border-radius: 12px;
    overflow: hidden; /* clips the 3x3 cells to the rounded border */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25); /* floating island shadow */
  }

  .cell-wrapper {
    background-color: var(--surface-color);
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
</style>
