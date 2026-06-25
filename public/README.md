# public/ — Static assets served at the root URL

```
public/
├── arcade/             — HTML5 games (standalone files)
│   ├── snake.html
│   ├── tetris.html
│   ├── breakout.html
│   ├── space-invaders.html
│   ├── minesweeper.html
│   ├── synesthesia.html
│   ├── pong/            (multi-file: index.html + game.js + style.css)
│   └── flappy-bird/     (multi-file: index.html + flappyBird.js + images/ + sounds/)
├── sounds/
│   └── sfx.js           — shared sound effects for Vintage-Games
├── uploads/             — user-uploaded media (gitignored, runtime-generated)
└── wave.svg             — decorative SVG
```

## Arcade games

Each game is a **standalone HTML file** (or folder) loaded in an `<iframe>`
by `src/components/arcade/ArcadeGameFrame.tsx`. Games are vanilla JS + Canvas
— no build step, no dependencies.

**Sources (MIT / open source):**
- Snake, Tetris, Breakout, Space Invaders → [Vintage-Games](https://github.com/Gbolahan-Aziz/Vintage-Games)
- Pong → [browser-games](https://github.com/juliensimon/browser-games)
- Flappy Bird → [FlappyBird-JavaScript](https://github.com/CodeExplainedRepo/FlappyBird-JavaScript)
- Minesweeper → [Mine-Sweeper](https://github.com/bocaletto-luca/Mine-Sweeper)
- 2048 → built in-app (React component)
- Synesthesia → built in-app (custom visualizer)
