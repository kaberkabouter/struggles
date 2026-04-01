<script lang="ts">
  import { game, eraseCell, setCellValue, toggleNote } from '../lib/gameState.svelte';
  import { getRelatedIndices } from '../lib/sudoku';
  import Cell from './Cell.svelte';
  import RadialMenu from './RadialMenu.svelte';

  interface Props {
    validateState?: 'idle' | 'valid' | 'invalid';
  }

  let { validateState = 'idle' }: Props = $props();

  // Derived highlighting values
  const activeValue = $derived.by(() => {
    const sc = game.selectedCell;
    if (sc !== null && game.grid[sc]?.value !== 0) return game.grid[sc].value;
    return null;
  });

  const relatedIndices = $derived(
    game.selectedCell !== null
      ? new Set(getRelatedIndices(game.selectedCell))
      : new Set<number>()
  );

  // ── Radial Menu state ─────────────────────────────────────────
  let radialCellIndex = $state(-1);
  let radialX = $state(0);
  let radialY = $state(0);

  function openRadial(idx: number, cx: number, cy: number) {
    radialCellIndex = idx;
    radialX = cx;
    radialY = cy;
  }

  function closeRadial() {
    radialCellIndex = -1;
  }

  // Single click/tap on a cell:
  //   - always selects the cell
  //   - if cell is empty & not fixed → toggle radial menu (open if closed, close if same cell)
  //   - if menu is open for a different cell → switch to new cell
  function handleCellClick(e: MouseEvent, idx: number) {
    const cell = game.grid[idx];
    if (!cell) return;

    game.selectedCell = idx;

    if (cell.isFixed || cell.value !== 0) {
      // Fixed or already-filled: just select, close any open menu
      closeRadial();
      return;
    }

    if (radialCellIndex === idx) {
      // Tapping the same empty cell again toggles the menu off
      closeRadial();
    } else {
      // Open (or move) the menu to this cell
      // Use the cell DOM centre as anchor
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      openRadial(idx, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }

  // Keyboard support: number keys while a cell is selected
  function handleKeyDown(e: KeyboardEvent) {
    const sc = game.selectedCell;
    if (sc === null) return;
    const cell = game.grid[sc];
    if (!cell || cell.isFixed) return;

    if (e.key >= '1' && e.key <= '9') {
      if (game.notesMode) toggleNote(sc, Number(e.key));
      else setCellValue(sc, Number(e.key));
      closeRadial();
    }
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      eraseCell(sc);
    }
    if (e.key === 'Escape') {
      closeRadial();
    }
  }

  // Board layout helpers
  function calcIndex(block: number, offset: number): number {
    const startRow = Math.floor(block / 3) * 3;
    const startCol = (block % 3) * 3;
    return (startRow + Math.floor(offset / 3)) * 9 + (startCol + offset % 3);
  }

  const BLOCKS = [0,1,2,3,4,5,6,7,8];
  const OFFSETS = [0,1,2,3,4,5,6,7,8];
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="board-container"
  class:victory={game.isGameWon}
  class:flash-valid={validateState === 'valid'}
  class:flash-invalid={validateState === 'invalid'}
  role="grid"
  aria-label="Sudoku board"
  onkeydown={handleKeyDown}
  tabindex="0"
>
  <div class="islands-board">
    {#each BLOCKS as block}
      <div class="island">
        {#each OFFSETS as offset}
          {@const idx = calcIndex(block, offset)}
          {@const cell = game.grid[idx]}
          {#if cell}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="cell-wrapper"
              role="gridcell"
              onclick={(e) => handleCellClick(e, idx)}
            >
              <Cell
                {cell}
                isSelected={game.selectedCell === idx}
                isRelated={game.selectedCell !== null && relatedIndices.has(idx)}
                isHighlightedNumber={activeValue !== null && activeValue === cell.value}
                hasConflict={game.conflicts.has(idx)}
                isRadialOpen={radialCellIndex === idx}
                {validateState}
              />
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
</div>

{#if radialCellIndex >= 0}
  <RadialMenu
    cellIndex={radialCellIndex}
    x={radialX}
    y={radialY}
    onclose={closeRadial}
  />
{/if}

<style>
  .board-container {
    width: 100%;
    max-width: min(var(--max-width), 95vw, 90dvh - var(--header-height) - 80px);
    aspect-ratio: 1;
    margin: 0 auto;
    box-sizing: border-box;
    border-radius: 4px;
    transition: box-shadow 0.4s ease, transform 0.4s ease;
    outline: none;
  }

  .board-container.victory {
    box-shadow: 0 0 0 3px var(--flash-valid), 0 0 32px rgba(63, 185, 80, 0.3);
    transform: scale(1.01);
  }

  .board-container.flash-valid {
    animation: flash-valid-pulse 1.2s ease forwards;
  }

  .board-container.flash-invalid {
    animation: flash-invalid-shake 0.5s ease forwards;
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
    gap: 1px;
    background-color: var(--island-border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--island-shadow);
  }

  .cell-wrapper {
    background-color: var(--surface-color);
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
</style>
