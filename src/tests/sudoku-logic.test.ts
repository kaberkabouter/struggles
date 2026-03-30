import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { 
  generateFilledBoard, 
  createPuzzle, 
  getConflicts, 
  BLANK, 
  isValid
} from '../lib/sudoku';
import { 
  grid, history, remainingCounts, conflicts, 
  startNewGame, setCellValue, toggleNote, undo 
} from '../lib/store';

describe('Sudoku Core Logic', () => {
  it('should generate a valid filled board', () => {
    const board = generateFilledBoard();
    expect(board.length).toBe(81);
    expect(board.includes(BLANK)).toBe(false);
    
    // Check there are no conflicts
    const c = getConflicts(board);
    expect(c.size).toBe(0);
  });

  it('should create a puzzle with holes symmetrically', () => {
    const { puzzle, solution } = createPuzzle(10);
    const zeroes = puzzle.filter(x => x === BLANK).length;
    // It should have removed some numbers, up to 10
    expect(zeroes).toBeGreaterThan(0);
    expect(zeroes).toBeLessThanOrEqual(10);
  });
});

describe('Sudoku Game Stores', () => {
  beforeEach(() => {
    // Start a new game with a very easy board for testing limits quickly
    startNewGame(5); 
  });

  it('should auto-clear notes on placing a number (Smart Notes)', () => {
    const currentGrid = get(grid);
    // Find first empty cell
    const emptyIndex = currentGrid.findIndex(c => c.value === BLANK);
    
    // Pick another empty cell in the same row
    const row = Math.floor(emptyIndex / 9);
    const relatedEmptyIndex = currentGrid.findIndex(c => c.value === BLANK && c.index !== emptyIndex && Math.floor(c.index / 9) === row);
    
    // Add notes to related cell
    if (relatedEmptyIndex !== -1) {
      toggleNote(relatedEmptyIndex, 5);
      expect(get(grid)[relatedEmptyIndex].notes).toContain(5);
      
      // Place 5 in the original empty cell
      setCellValue(emptyIndex, 5);
      
      // Smart notes should have cleared it
      expect(get(grid)[relatedEmptyIndex].notes).not.toContain(5);
    }
  });

  it('should detect conflicts correctly', () => {
    const currentGrid = get(grid);
    // Place number 1 in two adjacent cells
    const e1 = currentGrid.findIndex(c => c.value === BLANK);
    const e2 = currentGrid.findIndex((c, i) => c.value === BLANK && i > e1);
    
    if (e1 !== -1 && e2 !== -1 && Math.floor(e1/9) === Math.floor(e2/9)) {
       setCellValue(e1, 1);
       setCellValue(e2, 1);
       const conf = get(conflicts);
       expect(conf.has(e1)).toBe(true);
       expect(conf.has(e2)).toBe(true);
    }
  });

  it('should support undo operation', () => {
    const emptyIndex = get(grid).findIndex(c => c.value === BLANK);
    
    expect(get(history).length).toBe(0);
    setCellValue(emptyIndex, 9);
    
    expect(get(grid)[emptyIndex].value).toBe(9);
    expect(get(history).length).toBe(1);
    
    undo();
    
    expect(get(grid)[emptyIndex].value).toBe(BLANK);
    expect(get(history).length).toBe(0); // popping leaves state without history if no previous
  });
  
  it('should compute remaining counts correctly', () => {
    // Assume we have valid grid, wait: startNewGame initialized it
    const counts = get(remainingCounts);
    // 0 index is always 0
    expect(counts[0]).toBe(0);
    
    // Fill a cell and remaining counts for that number should drop
    const emptyIndex = get(grid).findIndex(c => c.value === BLANK);
    const old1Count = counts[1];
    setCellValue(emptyIndex, 1);
    
    const newCounts = get(remainingCounts);
    expect(newCounts[1]).toBe(old1Count - 1);
  });
});
