/**
 * Compact SVG thumbnails for each arcade game.
 * Each renders a pixel-art-style icon representing the game.
 */

type Props = { game: string; className?: string };

export function GameThumbnail({ game, className = '' }: Props) {
  const common = `w-full h-full ${className}`;

  switch (game) {
    case '2048':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} x={12 + c * 26} y={12 + r * 26} width="23" height="23" rx="3" fill="rgba(255,255,255,0.04)" />
            )),
          )}
          <rect x="12" y="38" width="23" height="23" rx="3" fill="#ff9f43" opacity="0.7" />
          <rect x="64" y="12" width="23" height="23" rx="3" fill="#f97316" opacity="0.7" />
          <rect x="38" y="64" width="23" height="23" rx="3" fill="#a855f7" opacity="0.7" />
          <rect x="64" y="90" width="23" height="23" rx="3" fill="#DFFF00" />
          <text x="76" y="106" textAnchor="middle" fontSize="7" fontFamily="monospace" fontWeight="bold" fill="#030305">2048</text>
        </svg>
      );

    case 'snake':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          <path d="M20 100 L20 80 L40 80 L40 60 L60 60 L60 40 L80 40 L80 20 L100 20" fill="none" stroke="#DFFF00" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          <circle cx="100" cy="20" r="5" fill="#DFFF00" />
          <circle cx="40" cy="100" r="4" fill="#DFFF00" opacity="0.4" />
          <circle cx="20" cy="60" r="4" fill="#DFFF00" opacity="0.3" />
        </svg>
      );

    case 'tetris':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="30" y="8" width="60" height="104" rx="4" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          <rect x="34" y="12" width="14" height="14" fill="#ff9f43" opacity="0.8" />
          <rect x="48" y="12" width="14" height="14" fill="#ff9f43" opacity="0.8" />
          <rect x="48" y="26" width="14" height="14" fill="#ff9f43" opacity="0.6" />
          <rect x="62" y="26" width="14" height="14" fill="#a855f7" opacity="0.8" />
          <rect x="34" y="40" width="14" height="14" fill="#22d3ee" opacity="0.8" />
          <rect x="48" y="40" width="14" height="14" fill="#22d3ee" opacity="0.6" />
          <rect x="34" y="54" width="14" height="14" fill="#10b981" opacity="0.8" />
          <rect x="48" y="54" width="14" height="14" fill="#10b981" opacity="0.6" />
          <rect x="62" y="54" width="14" height="14" fill="#10b981" opacity="0.4" />
          <rect x="34" y="68" width="14" height="14" fill="#DFFF00" opacity="0.9" />
          <rect x="48" y="68" width="14" height="14" fill="#DFFF00" opacity="0.7" />
          <rect x="62" y="68" width="14" height="14" fill="#DFFF00" opacity="0.5" />
          <rect x="76" y="68" width="14" height="14" fill="#DFFF00" opacity="0.3" />
        </svg>
      );

    case 'pong':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          <line x1="60" y1="14" x2="60" y2="106" stroke="rgba(223,255,0,0.15)" strokeWidth="1" strokeDasharray="4 6" />
          <rect x="16" y="42" width="6" height="36" rx="2" fill="#22d3ee" />
          <rect x="98" y="42" width="6" height="36" rx="2" fill="#22d3ee" opacity="0.7" />
          <circle cx="60" cy="60" r="5" fill="#DFFF00" />
          <circle cx="60" cy="60" r="8" fill="none" stroke="#DFFF00" strokeWidth="1" opacity="0.3" />
        </svg>
      );

    case 'breakout':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect key={`${r}-${c}`} x={16 + c * 18} y={16 + r * 10} width="15" height="7" rx="1" fill={['#DFFF00', '#ff9f43', '#f97316', '#a855f7'][r]} opacity={0.9 - r * 0.15} />
            )),
          )}
          <rect x="40" y="98" width="32" height="5" rx="2" fill="#DFFF00" />
          <circle cx="56" cy="78" r="4" fill="#DFFF00" />
        </svg>
      );

    case 'space-invaders':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          {/* Alien rows */}
          {[20, 40, 60].map((y, r) =>
            [20, 40, 60, 80, 100].map((x, c) => (
              <g key={`${r}-${c}`} opacity={0.9 - r * 0.2}>
                <rect x={x - 7} y={y - 4} width="14" height="8" rx="1" fill={['#DFFF00', '#ff9f43', '#f97316'][r]} />
                <rect x={x - 5} y={y + 2} width="3" height="3" fill={['#DFFF00', '#ff9f43', '#f97316'][r]} />
                <rect x={x + 2} y={y + 2} width="3" height="3" fill={['#DFFF00', '#ff9f43', '#f97316'][r]} />
              </g>
            )),
          )}
          {/* Player ship */}
          <rect x="50" y="96" width="20" height="6" rx="1" fill="#DFFF00" />
          <rect x="58" y="92" width="4" height="4" fill="#DFFF00" />
        </svg>
      );

    case 'flappy-bird':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          {/* Pipes */}
          <rect x="70" y="12" width="18" height="35" rx="2" fill="#10b981" opacity="0.7" />
          <rect x="70" y="70" width="18" height="38" rx="2" fill="#10b981" opacity="0.7" />
          {/* Bird */}
          <circle cx="35" cy="60" r="9" fill="#DFFF00" />
          <circle cx="39" cy="56" r="2.5" fill="#030305" />
          <path d="M44 58 L50 60 L44 62 Z" fill="#ff9f43" />
          {/* Ground */}
          <rect x="8" y="104" width="104" height="2" fill="rgba(223,255,0,0.2)" />
        </svg>
      );

    case 'minesweeper':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="none" stroke="rgba(223,255,0,0.15)" strokeWidth="1" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={16 + c * 30} y={16 + r * 30} width="27" height="27" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            )),
          )}
          <rect x="46" y="46" width="27" height="27" rx="2" fill="rgba(255,255,255,0.03)" />
          <circle cx="59" cy="59" r="8" fill="#6366f1" />
          <circle cx="56" cy="56" r="2" fill="#fff" opacity="0.6" />
          <text x="31" y="36" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="#22d3ee" textAnchor="middle">3</text>
          <text x="91" y="36" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="#ff9f43" textAnchor="middle">2</text>
          <text x="31" y="96" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="#DFFF00" textAnchor="middle">1</text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="8" fill="rgba(255,255,255,0.04)" />
        </svg>
      );
  }
}
