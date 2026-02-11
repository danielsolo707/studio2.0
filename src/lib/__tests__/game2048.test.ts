import { describe, it, expect } from 'vitest';
import { createEmptyBoard, addRandomTile, move, hasMoves, Board } from '../game2048';

const filledRow = (vals: number[]): Board => [vals, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

describe('game2048 core', () => {
  it('adds random tile', () => {
    const board = createEmptyBoard();
    const next = addRandomTile(board);
    const count = next.flat().filter((v) => v !== 0).length;
    expect(count).toBe(1);
  });

  it('moves left with merge once', () => {
    const board = filledRow([2, 2, 2, 0]);
    const { board: next, scoreGain, moved } = move(board, 'left');
    expect(moved).toBe(true);
    expect(next[0]).toEqual([4, 2, 0, 0]);
    expect(scoreGain).toBe(4);
  });

  it('detects no moves when full and blocked', () => {
    const full: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(hasMoves(full)).toBe(false);
  });

  it('detects moves when adjacency equal', () => {
    const board: Board = [
      [2, 2, 4, 8],
      [4, 8, 16, 32],
      [2, 4, 8, 16],
      [32, 64, 128, 256],
    ];
    expect(hasMoves(board)).toBe(true);
  });
});
