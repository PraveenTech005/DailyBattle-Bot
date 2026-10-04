import type { GameColor } from '../types/game';

export const ALL_GAME_COLORS: GameColor[] = [
  {
    id: 'cyan',
    name: 'CYAN',
    hex: '#00E5FF',
    textColor: '#0B0D19',
    borderGlow: 'rgba(0, 229, 255, 0.6)',
  },
  {
    id: 'magenta',
    name: 'MAGENTA',
    hex: '#FF007F',
    textColor: '#FFFFFF',
    borderGlow: 'rgba(255, 0, 127, 0.6)',
  },
  {
    id: 'lime',
    name: 'LIME',
    hex: '#00FF66',
    textColor: '#0B0D19',
    borderGlow: 'rgba(0, 255, 102, 0.6)',
  },
  {
    id: 'amber',
    name: 'AMBER',
    hex: '#FFB703',
    textColor: '#0B0D19',
    borderGlow: 'rgba(255, 183, 3, 0.6)',
  },
  {
    id: 'violet',
    name: 'VIOLET',
    hex: '#9D4EDD',
    textColor: '#FFFFFF',
    borderGlow: 'rgba(157, 78, 221, 0.6)',
  },
  {
    id: 'orange',
    name: 'ORANGE',
    hex: '#FF5400',
    textColor: '#FFFFFF',
    borderGlow: 'rgba(255, 84, 0, 0.6)',
  },
  {
    id: 'ruby',
    name: 'RUBY',
    hex: '#E63946',
    textColor: '#FFFFFF',
    borderGlow: 'rgba(230, 57, 70, 0.6)',
  },
  {
    id: 'blue',
    name: 'BLUE',
    hex: '#2196F3',
    textColor: '#FFFFFF',
    borderGlow: 'rgba(33, 150, 243, 0.6)',
  },
];

// Returns a subset of colors based on level (4 colors for Level 1, 5 for Level 2, 6 for Level 3)
export function getColorsForLevel(level: number): GameColor[] {
  if (level === 1) {
    return ALL_GAME_COLORS.slice(0, 4);
  }
  if (level === 2) {
    return ALL_GAME_COLORS.slice(0, 5);
  }
  return ALL_GAME_COLORS.slice(0, 6);
}
