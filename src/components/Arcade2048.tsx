"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, createEmptyBoard, addRandomTile, move, hasMoves, Direction, cloneBoard } from '@/lib/game2048';

type GameState = {
  board: Board;
  score: number;
  best: number;
  won: boolean;
  over: boolean;
};

const tileColors: Record<number, string> = {
  0: 'bg-white/5 text-transparent',
  2: 'bg-[#111827] text-white',
  4: 'bg-[#0f172a] text-[#f5f5f5]',
  8: 'bg-[#f97316] text-white',
  16: 'bg-[#fb923c] text-[#0b0b0f]',
  32: 'bg-[#f59e0b] text-[#0b0b0f]',
  64: 'bg-[#facc15] text-[#0b0b0f]',
  128: 'bg-[#a855f7] text-white',
  256: 'bg-[#6366f1] text-white',
  512: 'bg-[#22d3ee] text-[#0b0b0f]',
  1024: 'bg-[#10b981] text-[#0b0b0f]',
  2048: 'bg-[#dfff00] text-[#0b0b0f]',
};

function initGame(): GameState {
  let board = createEmptyBoard();
  board = addRandomTile(addRandomTile(board));
  return { board, score: 0, best: 0, won: false, over: false };
}

export function Arcade2048() {
  const [state, setState] = useState<GameState>(() => {
    const base = initGame();
    if (typeof window !== 'undefined') {
      const best = Number(localStorage.getItem('arcade-2048-best') || 0);
      base.best = best;
    }
    return base;
  });
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [prevScore, setPrevScore] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const map: Record<string, Direction> = {
        arrowup: 'up',
        w: 'up',
        arrowdown: 'down',
        s: 'down',
        arrowleft: 'left',
        a: 'left',
        arrowright: 'right',
        d: 'right',
      };
      if (map[key]) {
        e.preventDefault();
        handleMove(map[key]);
      }
      if (key === 'r') restart();
      if (key === 'z') undo();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arcade-2048-best', String(state.best));
    }
  }, [state.best]);

  const handleMove = (dir: Direction) => {
    if (state.over || state.won) return;
    const { board: movedBoard, moved, scoreGain } = move(state.board, dir);
    if (!moved) return;

    const withSpawn = addRandomTile(movedBoard);
    const score = state.score + scoreGain;
    const best = Math.max(score, state.best);
    const won = withSpawn.flat().some((v) => v >= 2048);
    const over = !hasMoves(withSpawn);

    setPrevBoard(cloneBoard(state.board));
    setPrevScore(state.score);
    setState({ board: withSpawn, score, best, won, over });
  };

  const restart = () => setState((prev) => ({ ...initGame(), best: prev.best }));
  const undo = () => {
    if (prevBoard) {
      setState((prev) => ({ ...prev, board: prevBoard, score: prevScore, over: false, won: false }));
      setPrevBoard(null);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    touchStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 24) return;
    if (absX > absY) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
    touchStart.current = null;
  };

  const grid = state.board;

  const overlayText = state.over ? 'Game Over' : state.won ? 'You Win!' : null;

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-[#ff9f43] font-headline uppercase">Secret Arcade</p>
          <h1 className="font-headline text-3xl tracking-tight">2048</h1>
        </div>
        <div className="flex gap-3">
          <Stat label="SCORE" value={state.score} />
          <Stat label="BEST" value={state.best} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs font-headline tracking-[0.3em] text-white/70">
        <button className="px-3 py-2 border border-white/20 hover:border-[#ff9f43]" onClick={restart}>RESTART</button>
        <button className="px-3 py-2 border border-white/20 hover:border-[#ff9f43]" onClick={undo} disabled={!prevBoard}>
          UNDO
        </button>
        <span className="text-white/40">Arrows / WASD • Swipe</span>
      </div>

      <div
        className="relative rounded-3xl p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {grid.flat().map((val, idx) => {
            const r = Math.floor(idx / 4);
            const c = idx % 4;
            const key = `${r}-${c}`;
            return (
              <Tile key={key} value={val} />
            );
          })}
        </div>

        <AnimatePresence>
          {overlayText && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-headline text-3xl tracking-[0.4em] text-[#ff9f43]">{overlayText}</p>
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-[#ff9f43] text-black font-headline text-xs tracking-[0.3em]" onClick={restart}>
                  RESTART
                </button>
                <button className="px-4 py-2 border border-white/30 text-white/80 font-headline text-xs tracking-[0.3em]" onClick={undo}>
                  UNDO
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-right">
      <div className="text-[9px] tracking-[0.4em] text-white/60 font-headline">{label}</div>
      <div className="text-xl font-headline text-white">{value}</div>
    </div>
  );
}

function Tile({ value }: { value: number }) {
  const color = tileColors[value] || 'bg-white/20 text-white';
  return (
    <motion.div
      layout
      className={clsx(
        'aspect-square rounded-2xl flex items-center justify-center text-2xl font-headline shadow-inner',
        color,
      )}
      initial={{ scale: 0.9, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      {value !== 0 ? value : ''}
    </motion.div>
  );
}
