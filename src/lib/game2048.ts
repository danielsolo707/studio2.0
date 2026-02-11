export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function rotateRight(board: Board): Board {
  const res = createEmptyBoard();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      res[c][3 - r] = board[r][c];
    }
  }
  return res;
}

function rotateLeft(board: Board): Board {
  const res = createEmptyBoard();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      res[3 - c][r] = board[r][c];
    }
  }
  return res;
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

export function addRandomTile(board: Board): Board {
  const empties: Array<[number, number]> = [];
  board.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val === 0) empties.push([r, c]);
    }),
  );
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = cloneBoard(board);
  next[r][c] = value;
  return next;
}

export function compressRow(row: number[]): { row: number[]; scoreGain: number } {
  const filtered = row.filter((v) => v !== 0);
  const result: number[] = [];
  let scoreGain = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      scoreGain += merged;
      i++;
    } else {
      result.push(filtered[i]);
    }
  }
  while (result.length < 4) result.push(0);
  return { row: result, scoreGain };
}

export function moveLeft(board: Board): { board: Board; moved: boolean; scoreGain: number } {
  let moved = false;
  let scoreGain = 0;
  const next = board.map((row) => {
    const { row: compressed, scoreGain: gain } = compressRow(row);
    if (!moved && compressed.some((v, idx) => v !== row[idx])) moved = true;
    scoreGain += gain;
    return compressed;
  });
  return { board: next, moved, scoreGain };
}

export function move(board: Board, direction: Direction): { board: Board; moved: boolean; scoreGain: number } {
  let working = board;
  if (direction === 'up') working = rotateLeft(board);
  if (direction === 'down') working = rotateRight(board);
  if (direction === 'right') working = reverseRows(board);

  const { board: shifted, moved, scoreGain } = moveLeft(working);

  let restored = shifted;
  if (direction === 'up') restored = rotateRight(shifted);
  if (direction === 'down') restored = rotateLeft(shifted);
  if (direction === 'right') restored = reverseRows(shifted);

  return { board: restored, moved, scoreGain };
}

export function hasMoves(board: Board): boolean {
  // empty spots
  if (board.some((row) => row.includes(0))) return true;
  // adjacent equal
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      if ((c < 3 && board[r][c + 1] === val) || (r < 3 && board[r + 1][c] === val)) return true;
    }
  }
  return false;
}
