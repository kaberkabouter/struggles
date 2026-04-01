import { getConflicts, getRelatedIndices, createPuzzle, BLANK } from './sudoku';
import { playPlacementTone, playErrorTone } from './audio';

export { BLANK };

export interface SudokuCell {
  index: number;
  value: number;
  isFixed: boolean;
  notes: number[];
}

// ── Module-level reactive state (Svelte 5 Runes) ──────────────────────────────
let _grid = $state<SudokuCell[]>([]);
let _selectedCell = $state<number | null>(null);
let _notesMode = $state(false);
let _history = $state<SudokuCell[][]>([]);

// ── Derived ───────────────────────────────────────────────────────────────────
const _conflicts = $derived(getConflicts(_grid.map((c) => c.value)));

const _remainingCounts = $derived.by(() => {
  const counts = new Array(10).fill(9);
  counts[0] = 0;
  for (const c of _grid) {
    if (c.value !== BLANK) counts[c.value]--;
  }
  return counts;
});

const _isGameWon = $derived(
  _grid.length > 0 &&
  _grid.every((c) => c.value !== BLANK) &&
  _conflicts.size === 0
);

// ── Public reactive proxy ─────────────────────────────────────────────────────
export const game = {
  get grid() { return _grid; },
  get selectedCell() { return _selectedCell; },
  set selectedCell(v: number | null) { _selectedCell = v; },
  get notesMode() { return _notesMode; },
  set notesMode(v: boolean) { _notesMode = v; },
  get history() { return _history; },
  get conflicts() { return _conflicts; },
  get remainingCounts() { return _remainingCounts; },
  get isGameWon() { return _isGameWon; },
};

// ── Actions ───────────────────────────────────────────────────────────────────

export function startNewGame(holes: number = 40): void {
  // Feature 1 — Iron-Man Purist: solution is discarded immediately
  const { puzzle } = createPuzzle(holes);
  _grid = puzzle.map((value, index): SudokuCell => ({
    index,
    value,
    isFixed: value !== BLANK,
    notes: [],
  }));
  _history = [];
  _selectedCell = null;
  _persist(_grid);
}

function _snapshot(): void {
  _history = [..._history, JSON.parse(JSON.stringify(_grid))];
}

export function undo(): void {
  if (_history.length === 0) return;
  const prev = [..._history];
  const last = prev.pop()!;
  _grid = last;
  _history = prev;
  _persist(last);
}

export function setCellValue(cellIndex: number, val: number): void {
  if (!_grid[cellIndex] || _grid[cellIndex].isFixed) return;
  _snapshot();

  const related = new Set(getRelatedIndices(cellIndex));

  // Feature 4 — Auto-clear pencil notes from related cells
  _grid = _grid.map((c, i) => {
    if (i === cellIndex) return { ...c, value: val, notes: [] };
    if (val !== BLANK && related.has(i)) {
      return { ...c, notes: c.notes.filter((n) => n !== val) };
    }
    return c;
  });

  const afterConflicts = getConflicts(_grid.map((c) => c.value));
  if (afterConflicts.has(cellIndex)) {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate([50]);
    }
    playErrorTone();
  } else {
    playPlacementTone();
  }

  _persist(_grid);
}

export function toggleNote(cellIndex: number, val: number): void {
  const cell = _grid[cellIndex];
  if (!cell || cell.isFixed || cell.value !== BLANK) return;
  _snapshot();

  _grid = _grid.map((c, i) => {
    if (i !== cellIndex) return c;
    const notes = c.notes.includes(val)
      ? c.notes.filter((n) => n !== val)
      : [...c.notes, val].sort((a, b) => a - b);
    return { ...c, notes };
  });
  _persist(_grid);
}

export function eraseCell(cellIndex: number): void {
  const cell = _grid[cellIndex];
  if (!cell || cell.isFixed) return;
  if (cell.value === BLANK && cell.notes.length === 0) return;
  _snapshot();
  _grid = _grid.map((c, i) =>
    i === cellIndex ? { ...c, value: BLANK, notes: [] } : c
  );
  _persist(_grid);
}

export function handleRadialInput(cellIndex: number, val: number): void {
  if (game.notesMode) {
    toggleNote(cellIndex, val);
  } else {
    setCellValue(cellIndex, val);
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────
function _persist(state: SudokuCell[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sudoku_state', JSON.stringify(state));
  }
}

export function loadFromLocalStorage(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sudoku_state');
    if (saved) {
      try {
        _grid = JSON.parse(saved);
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}
