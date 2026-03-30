import { writable, derived, get } from 'svelte/store';
import { createPuzzle, getRelatedIndices, getConflicts, BLANK } from './sudoku';

export { BLANK };
export type InputMode = 'cell' | 'number';

export interface SudokuCell {
  index: number;
  value: number; // 0 for empty
  isFixed: boolean; // original puzzle numbers
  notes: number[];
}

// History stack
export const history = writable<SudokuCell[][]>([]);

// Core game state
export const grid = writable<SudokuCell[]>([]);
export const inputMode = writable<InputMode>('cell');
export const selectedCell = writable<number | null>(null);
export const selectedNumber = writable<number | null>(null);
export const notesMode = writable<boolean>(false);

// Derived state
export const conflicts = derived(grid, ($grid) => {
  return getConflicts($grid.map((c) => c.value));
});

export const remainingCounts = derived(grid, ($grid) => {
  const counts = new Array(10).fill(9); // indices 0-9
  counts[0] = 0;
  $grid.forEach(c => {
    if (c.value !== BLANK) {
      counts[c.value]--;
    }
  });
  return counts;
});

// Helpers
export function startNewGame(difficultyHoles: number = 40) {
  const { puzzle } = createPuzzle(difficultyHoles);
  const initialGrid: SudokuCell[] = puzzle.map((value, index) => ({
    index,
    value,
    isFixed: value !== BLANK,
    notes: []
  }));
  
  grid.set(initialGrid);
  history.set([]);
  selectedCell.set(null);
  selectedNumber.set(null);
  
  saveToLocalStorage(initialGrid);
}

export function saveState() {
  // Save deep copy
  history.update(h => [...h, JSON.parse(JSON.stringify(get(grid)))]);
}

export function undo() {
  const h = get(history);
  if (h.length > 0) {
    const previous = h.pop()!;
    grid.set(previous);
    history.set(h);
    saveToLocalStorage(previous);
  }
}

export function setCellValue(cellIndex: number, val: number) {
  const $grid = get(grid);
  if ($grid[cellIndex].isFixed) return;
  
  saveState();
  
  $grid[cellIndex].value = val;
  $grid[cellIndex].notes = [];
  
  // Smart notes: clear notes from related cells
  const related = getRelatedIndices(cellIndex);
  for (const r of related) {
    $grid[r].notes = $grid[r].notes.filter(n => n !== val);
  }
  
  // Vibrate on invalid move (assuming window.navigator.vibrate exists)
  const isConflicting = getConflicts($grid.map(c => c.value)).size > 0;
  if (isConflicting && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate([50]);
  }

  grid.set([...$grid]);
  saveToLocalStorage($grid);
}

export function toggleNote(cellIndex: number, val: number) {
  const $grid = get(grid);
  if ($grid[cellIndex].isFixed || $grid[cellIndex].value !== BLANK) return;
  
  saveState();
  
  const notes = $grid[cellIndex].notes;
  if (notes.includes(val)) {
    $grid[cellIndex].notes = notes.filter(n => n !== val);
  } else {
    $grid[cellIndex].notes = [...notes, val].sort((a,b) => a - b);
  }
  
  grid.set([...$grid]);
  saveToLocalStorage($grid);
}

export function eraseCell(cellIndex: number) {
  const $grid = get(grid);
  if ($grid[cellIndex].isFixed || $grid[cellIndex].value === BLANK) return;
  
  saveState();
  $grid[cellIndex].value = BLANK;
  grid.set([...$grid]);
  saveToLocalStorage($grid);
}

export function handleInput(val: number) {
  const $mode = get(inputMode);
  
  if ($mode === 'cell') {
    const $selectedCell = get(selectedCell);
    const $notesMode = get(notesMode);
    
    if ($selectedCell !== null) {
      if ($notesMode) toggleNote($selectedCell, val);
      else setCellValue($selectedCell, val);
    }
  } else {
    selectedNumber.set(val);
  }
}

export function handleCellClick(index: number) {
  const $mode = get(inputMode);
  
  if ($mode === 'cell') {
    selectedCell.set(index);
  } else {
    const $selectedNumber = get(selectedNumber);
    const $notesMode = get(notesMode);
    
    if ($selectedNumber !== null) {
       if ($notesMode) toggleNote(index, $selectedNumber);
       else setCellValue(index, $selectedNumber);
    }
    selectedCell.set(index); // for smart highlighting across the board
  }
}

// Persistence
function saveToLocalStorage(state: SudokuCell[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sudoku_state', JSON.stringify(state));
  }
}

export function loadFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sudoku_state');
    if (saved) {
      grid.set(JSON.parse(saved));
      return true;
    }
  }
  return false;
}
