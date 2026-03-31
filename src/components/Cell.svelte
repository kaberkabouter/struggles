<script lang="ts">
  import type { SudokuCell } from '../lib/store';
  import { handleCellClick, BLANK } from '../lib/store';

  export let cell: SudokuCell;
  export let isSelected: boolean = false;
  export let isRelated: boolean = false;
  export let isHighlightedNumber: boolean = false;
  export let hasConflict: boolean = false;

  // Derive logical states
  $: isFixed = cell.isFixed;
  $: hasValue = cell.value !== BLANK;
  $: cssClass = `
    cell 
    ${isFixed ? 'fixed' : 'player'} 
    ${isSelected ? 'selected' : ''} 
    ${!isSelected && isRelated ? 'related' : ''} 
    ${!isSelected && !isRelated && isHighlightedNumber ? 'highlighted-num' : ''}
    ${hasConflict ? 'conflict' : ''}
  `.replace(/\s+/g, ' ').trim();

  function onClick() {
    handleCellClick(cell.index);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class={cssClass} on:click={onClick}>
  {#if hasValue}
    <span class="value">{cell.value}</span>
  {:else if cell.notes && cell.notes.length > 0}
    <div class="notes-grid">
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as n}
        <span class="note {cell.notes.includes(n) ? 'active' : ''}">
          {cell.notes.includes(n) ? n : ''}
        </span>
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
    font-size: clamp(1.2rem, 5vw, 2rem);
    font-weight: 500;
    cursor: pointer;
    background-color: var(--surface-color);
    box-sizing: border-box;
    position: relative;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .value {
    pointer-events: none;
  }

  /* Text Colors */
  .fixed {
    color: var(--fixed-text);
    font-weight: 600;
  }
  .player {
    color: var(--player-text);
    font-weight: 500;
  }

  /* Background States */
  .selected {
    background-color: var(--primary-light);
  }
  .related {
    background-color: var(--highlight-bg);
  }
  .highlighted-num {
    background-color: var(--highlight-same);
  }
  .conflict {
    background-color: var(--error-bg);
    color: var(--error);
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
    font-size: clamp(0.4rem, 2vw, 0.7rem);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
</style>
