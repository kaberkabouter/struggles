// Sudoku Game Logic

export const BLANK = 0;

/**
 * Get row, col, and block index for a linear cell index (0-80).
 */
export function getRowColBlock(index: number) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  return { row, col, block };
}

/**
 * Returns indices of all cells in the same row, col, and block.
 */
export function getRelatedIndices(index: number): number[] {
  const { row, col, block } = getRowColBlock(index);
  const related = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (i === index) continue;
    const current = getRowColBlock(i);
    if (current.row === row || current.col === col || current.block === block) {
      related.add(i);
    }
  }
  return Array.from(related);
}

/**
 * Check if putting `num` at `index` on `board` is valid.
 */
export function isValid(board: number[], index: number, num: number): boolean {
  if (num === BLANK) return true;
  const related = getRelatedIndices(index);
  for (const rIndex of related) {
    if (board[rIndex] === num) return false;
  }
  return true;
}

/**
 * Find the first empty cell, or -1 if full.
 */
function findEmpty(board: number[]): number {
  return board.indexOf(BLANK);
}

/**
 * Shuffle array in-place.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Recursively fills the board to create a valid Sudoku.
 */
export function generateFilledBoard(): number[] {
  const board = new Array(81).fill(BLANK);

  function fill(b: number[]): boolean {
    const emptyIndex = findEmpty(b);
    if (emptyIndex === -1) return true; // Filled

    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of nums) {
      if (isValid(b, emptyIndex, num)) {
        b[emptyIndex] = num;
        if (fill(b)) return true;
        b[emptyIndex] = BLANK;
      }
    }
    return false;
  }

  fill(board);
  return board;
}

/**
 * Counts the number of solutions for a given board. Fast bail out at `limit`.
 */
export function countSolutions(board: number[], limit: number = 2): number {
  let count = 0;

  function solveCount(b: number[]): void {
    if (count >= limit) return;
    const emptyIndex = findEmpty(b);
    if (emptyIndex === -1) {
      count++;
      return;
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(b, emptyIndex, num)) {
        b[emptyIndex] = num;
        solveCount(b);
        b[emptyIndex] = BLANK;
      }
    }
  }

  const copy = [...board];
  solveCount(copy);
  return count;
}

/**
 * Creates a Sudoku puzzle and its solution.
 * `holes` specify how many cells to empty.
 */
export function createPuzzle(holes: number = 40): { puzzle: number[], solution: number[] } {
  const solution = generateFilledBoard();
  const puzzle = [...solution];

  // Make list of pairs symmetric to the center
  const cellPairs: [number, number][] = [];
  for (let i = 0; i < 40; i++) {
    cellPairs.push([i, 80 - i]); // e.g., 0 and 80, 1 and 79
  }
  cellPairs.push([40, 40]); // center cell
  shuffle(cellPairs);

  let holesDug = 0;

  for (const [c1, c2] of cellPairs) {
    if (holesDug >= holes) break;

    const backup1 = puzzle[c1];
    const backup2 = puzzle[c2];

    puzzle[c1] = BLANK;
    puzzle[c2] = BLANK;

    // If it's a center cell it's only 1 hole, otherwise it's 2
    let currentDug = (c1 === c2) ? 1 : 2;

    if (countSolutions(puzzle, 2) === 1) {
      holesDug += currentDug;
    } else {
      puzzle[c1] = backup1;
      puzzle[c2] = backup2;
    }
  }

  return { puzzle, solution };
}

/**
 * Check the full board for conflicts.
 * Returns a Set of indices which violate rules.
 */
export function getConflicts(board: number[]): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    const num = board[i];
    if (num === BLANK) continue;
    const related = getRelatedIndices(i);
    for (const r of related) {
      if (board[r] === num) {
        conflicts.add(i);
        break; // found at least one conflict for this cell
      }
    }
  }
  return conflicts;
}
