"use client";

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, createEmptyBoard, addRandomTile, move, hasMoves, Direction, cloneBoard } from '@/lib/game2048';
import { useLockScroll } from '@/hooks/useLockScroll';

type GameState = {
  board: Board;
  score: number;
  best: number;
  won: boolean;
  over: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  value: number;
  targetX: number;
  targetY: number;
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

const tileGlowColors: Record<number, string> = {
  0: '',
  2: 'shadow-[0_0_15px_rgba(17,24,39,0.5)]',
  4: 'shadow-[0_0_15px_rgba(15,23,42,0.5)]',
  8: 'shadow-[0_0_20px_rgba(249,115,22,0.7)]',
  16: 'shadow-[0_0_20px_rgba(251,146,60,0.7)]',
  32: 'shadow-[0_0_20px_rgba(245,158,11,0.7)]',
  64: 'shadow-[0_0_20px_rgba(250,204,21,0.7)]',
  128: 'shadow-[0_0_25px_rgba(168,85,247,0.8)]',
  256: 'shadow-[0_0_25px_rgba(99,102,241,0.8)]',
  512: 'shadow-[0_0_25px_rgba(34,211,238,0.8)]',
  1024: 'shadow-[0_0_30px_rgba(16,185,129,0.9)]',
  2048: 'shadow-[0_0_35px_rgba(223,255,0,1)]',
};

function initGame(): GameState {
  let board = createEmptyBoard();
  board = addRandomTile(addRandomTile(board));
  return { board, score: 0, best: 0, won: false, over: false };
}

export function Arcade2048() {
  useLockScroll(true);
  const [state, setState] = useState<GameState | null>(null);
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [prevScore, setPrevScore] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const particleId = useRef(0);

  // Initialize game state on client only
  useEffect(() => {
    const initial = initGame();
    if (typeof window !== 'undefined') {
      const savedBest = Number(localStorage.getItem('arcade-2048-best') || 0);
      if (savedBest > 0) {
        initial.best = savedBest;
      }
    }
    setState(initial);
  }, []);

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
    if (state && typeof window !== 'undefined') {
      localStorage.setItem('arcade-2048-best', String(state.best));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.best]);

  const createParticles = (newValue: number, targetPosition: { x: number; y: number }) => {
    const newParticles: Particle[] = [];
    const count = Math.min(newValue / 2, 8); // More particles for higher numbers
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleId.current++,
        x: targetPosition.x + (Math.random() - 0.5) * 40,
        y: targetPosition.y + (Math.random() - 0.5) * 40,
        value: newValue,
        targetX: targetPosition.x,
        targetY: targetPosition.y,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1000);
  };

  const handleMove = (dir: Direction) => {
    if (!state) return;
    if (state.over || state.won) return;
    const { board: movedBoard, moved, scoreGain } = move(state.board, dir);
    if (!moved) return;

    const withSpawn = addRandomTile(movedBoard);
    const score = state.score + scoreGain;
    const best = Math.max(score, state.best);
    const won = withSpawn.flat().some((v) => v >= 2048);
    const over = !hasMoves(withSpawn);

    // Find merged tiles for particle effects
    if (scoreGain > 0) {
      const gridElement = document.querySelector('.game-grid');
      if (gridElement) {
        const rect = gridElement.getBoundingClientRect();
        createParticles(scoreGain, { 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }
    }

    // Celebration effect for winning
    if (won && !state.won) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    }

    setPrevBoard(cloneBoard(state.board));
    setPrevScore(state.score);
    setState({ board: withSpawn, score, best, won, over });
  };

  const restart = () => {
    setState((prev) => {
      const next = initGame();
      return { ...next, best: prev?.best ?? next.best };
    });
    setCelebrating(false);
    setParticles([]);
  };
  
  const undo = () => {
    if (prevBoard) {
      setState((prev) => {
        if (!prev) return prev;
        return { ...prev, board: prevBoard, score: prevScore, over: false, won: false };
      });
      setPrevBoard(null);
      setParticles([]);
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

  if (!state) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading…</div>;
  }
  const grid = state.board;
  const overlayText = state.over ? 'Game Over' : state.won ? 'You Win!' : null;

  return (
    <div className="max-w-2xl mx-auto text-white">
      {/* Celebration particles */}
      <AnimatePresence>
        {celebrating && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#dfff00]"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  y: [null, -100],
                  opacity: 0,
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={clsx(
              'absolute pointer-events-none text-xs font-bold',
              tileColors[particle.value] || 'bg-white/20'
            )}
            style={{
              left: particle.x,
              top: particle.y,
            }}
            initial={{ opacity: 1, scale: 0.8 }}
            animate={{
              x: particle.targetX - particle.x,
              y: particle.targetY - particle.y,
              opacity: 0,
              scale: 1.2,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            +{particle.value}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-[#ff9f43] font-headline uppercase">Secret Arcade</p>
          <h1 className="font-headline text-2xl md:text-3xl tracking-tight">2048</h1>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Stat label="SCORE" value={state.score} />
          <Stat label="BEST" value={state.best} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 text-xs font-headline tracking-[0.3em] text-white/70">
        <button className="px-3 py-2 border border-white/20 hover:border-[#ff9f43] transition-colors" onClick={restart}>RESTART</button>
        <button 
          className="px-3 py-2 border border-white/20 hover:border-[#ff9f43] transition-colors disabled:opacity-50" 
          onClick={undo} 
          disabled={!prevBoard}
        >
          UNDO
        </button>
        <span className="text-white/40 hidden sm:inline">Arrows / WASD • Swipe</span>
      </div>

      <div
        className="relative rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div 
          className="game-grid grid grid-cols-4 gap-2 md:gap-3 lg:gap-4"
          style={{ maxWidth: 'min(80vw, 500px)', margin: '0 auto' }}
        >
          {grid.flat().map((val, idx) => {
            const r = Math.floor(idx / 4);
            const c = idx % 4;
            const key = `${r}-${c}`;
            return (
              <Tile key={key} value={val} position={{ r, c }} />
            );
          })}
        </div>

        <AnimatePresence>
          {overlayText && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl md:rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p 
                className="font-headline text-2xl md:text-3xl tracking-[0.4em] text-[#ff9f43]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {overlayText}
              </motion.p>
              <div className="flex gap-3 mt-4">
                <button 
                  className="px-4 py-2 bg-[#ff9f43] text-black font-headline text-xs tracking-[0.3em] hover:bg-[#ffa74d] transition-colors"
                  onClick={restart}
                >
                  RESTART
                </button>
                <button 
                  className="px-4 py-2 border border-white/30 text-white/80 font-headline text-xs tracking-[0.3em] hover:border-white/50 transition-colors"
                  onClick={undo}
                >
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
    <div className="px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-white/10 border border-white/10 text-right min-w-[80px]">
      <div className="text-[8px] md:text-[9px] tracking-[0.4em] text-white/60 font-headline">{label}</div>
      <div className="text-lg md:text-xl font-headline text-white">{value}</div>
    </div>
  );
}

function Tile({ value, position }: { value: number; position: { r: number; c: number } }) {
  const color = tileColors[value] || 'bg-white/20 text-white';
  const glow = tileGlowColors[value] || '';
  
  return (
    <motion.div
      layout
      className={clsx(
        'aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl font-headline shadow-inner transition-all duration-200',
        color,
        glow,
        value > 1000 ? 'animate-pulse' : ''
      )}
      initial={{ scale: 0.8, opacity: 0.3 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: value > 0 ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
      }}
      whileHover={{ scale: value > 0 ? 1.05 : 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.2 
      }}
    >
      {value !== 0 ? value : ''}
    </motion.div>
  );
}
