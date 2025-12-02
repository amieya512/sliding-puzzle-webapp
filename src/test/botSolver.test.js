import { describe, it, expect } from "vitest";
import { computeBotMoves } from "../utils/botSolver.js";

describe("computeBotMoves", () => {
  const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  /**
   * Helper function to apply a move (click a tile) to a board state.
   * @param {number[]} board - Current board state
   * @param {number} tileIndex - Index of the tile to click
   * @returns {number[]} New board state after the move
   */
  function applyMove(board, tileIndex) {
    const blankIdx = board.indexOf(0);
    const next = [...board];
    [next[blankIdx], next[tileIndex]] = [next[tileIndex], next[blankIdx]];
    return next;
  }

  /**
   * Apply a sequence of moves to a board and return the final state.
   * @param {number[]} startBoard - Starting board state
   * @param {number[]} moves - Array of tile indices to click
   * @returns {number[]} Final board state after all moves
   */
  function applyMoves(startBoard, moves) {
    let current = startBoard;
    for (const moveIdx of moves) {
      current = applyMove(current, moveIdx);
    }
    return current;
  }

  describe("optimal solution length validation", () => {
    it("solves board one move away from goal", () => {
      // One move away: [1,2,3,4,5,6,7,0,8]
      // Move tile 8 (index 7) to the blank (index 7) -> actually need to move blank to tile 8
      // Actually: blank is at 7, tile 8 is at 8, so click tile at index 8
      const startBoard = [1, 2, 3, 4, 5, 6, 7, 0, 8];
      const expectedOptimalLength = 1;

      const result = computeBotMoves(startBoard, 3);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(expectedOptimalLength);

      // Verify applying the moves reaches the goal
      const finalBoard = applyMoves(startBoard, result);
      expect(finalBoard).toEqual(goal);
    });

    it("solves board two moves away from goal", () => {
      // Two moves away: [1,2,3,4,5,6,0,7,8]
      const startBoard = [1, 2, 3, 4, 5, 6, 0, 7, 8];
      const expectedOptimalLength = 2;

      const result = computeBotMoves(startBoard, 3);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(expectedOptimalLength);

      // Verify applying the moves reaches the goal
      const finalBoard = applyMoves(startBoard, result);
      expect(finalBoard).toEqual(goal);
    });

    it("solves board three moves away from goal", () => {
      // Three moves away: [1,0,3,4,2,5,7,8,6]
      // Layout: 1 0 3
      //         4 2 5
      //         7 8 6
      const startBoard = [1, 0, 3, 4, 2, 5, 7, 8, 6];
      const expectedOptimalLength = 3;

      const result = computeBotMoves(startBoard, 3);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(expectedOptimalLength);

      // Verify applying the moves reaches the goal
      const finalBoard = applyMoves(startBoard, result);
      expect(finalBoard).toEqual(goal);
    });
  });

  describe("edge cases", () => {
    it("returns empty array for already solved board", () => {
      const solvedBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      const result = computeBotMoves(solvedBoard, 3);
      expect(result).toEqual([]);
    });

    it("returns empty array for non-3x3 boards", () => {
      const board = [1, 2, 3, 4, 5, 6, 7, 8, 0, 9, 10, 11, 12, 13, 14, 15];
      const result = computeBotMoves(board, 4);
      expect(result).toEqual([]);
    });
  });
});

