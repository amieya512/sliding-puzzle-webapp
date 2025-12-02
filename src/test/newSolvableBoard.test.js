import { describe, it, expect } from "vitest";
import { newSolvableBoard } from "../utils/shuffle.js";

/**
 * Helper function to check if a board is solvable using inversion counting rules.
 * For odd-sized boards: solvable if inversions are even.
 * For even-sized boards: solvable if (inversions + blank row from bottom) is odd.
 */
function isSolvable(tiles, size) {
  // Count inversions (excluding blank tile 0)
  const nums = tiles.filter((x) => x !== 0);
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) {
        inversions++;
      }
    }
  }

  // For odd-sized boards (3x3, 5x5, etc.)
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }

  // For even-sized boards (4x4, 6x6, etc.)
  const blankIndex = tiles.indexOf(0);
  const blankRowFromBottom = size - Math.floor(blankIndex / size);

  if (blankRowFromBottom % 2 === 0) {
    return inversions % 2 === 1;
  }
  return inversions % 2 === 0;
}

describe("newSolvableBoard", () => {
  const sizes = [3, 4, 5];
  const boardsPerSize = 10;

  sizes.forEach((size) => {
    describe(`size ${size}x${size}`, () => {
      it(`generates ${boardsPerSize} valid and solvable boards`, () => {
        const boards = [];
        const expectedTileCount = size * size;
        const expectedNumbers = new Set(
          Array.from({ length: expectedTileCount }, (_, i) => i)
        );

        for (let i = 0; i < boardsPerSize; i++) {
          const board = newSolvableBoard(size);

          // Rule 1: Board contains size*size tiles
          expect(board).toHaveLength(expectedTileCount);

          // Rule 2: Board contains all numbers from 0 to size*size - 1 with no duplicates
          const boardSet = new Set(board);
          expect(boardSet.size).toBe(expectedTileCount);
          expect(boardSet).toEqual(expectedNumbers);

          // Rule 3: Board is solvable
          expect(isSolvable(board, size)).toBe(true);

          // Store board for uniqueness check
          boards.push(board);
        }

        // Rule 4: Boards differ on each generation (not all identical)
        const uniqueBoards = new Set(boards.map((b) => b.join(",")));
        expect(uniqueBoards.size).toBeGreaterThan(1);
      });
    });
  });
});

