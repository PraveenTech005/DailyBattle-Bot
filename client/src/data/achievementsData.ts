import type { Achievement } from '../types/user';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_rush',
    title: 'First Rush',
    description: 'Complete your first 30-second Color Rush match.',
    icon: '🎯',
    unlocked: false,
    rewardCoins: 50,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Achieve a reaction time under 250ms.',
    icon: '⚡',
    unlocked: false,
    rewardCoins: 100,
  },
  {
    id: 'combo_king',
    title: 'Combo King',
    description: 'Reach a 10x consecutive combo.',
    icon: '🔥',
    unlocked: false,
    rewardCoins: 150,
  },
  {
    id: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Finish a match with 95% or higher accuracy.',
    icon: '🎯',
    unlocked: false,
    rewardCoins: 200,
  },
  {
    id: 'score_5k',
    title: 'High Roller',
    description: 'Score over 5,000 points in a single match.',
    icon: '🏆',
    unlocked: false,
    rewardCoins: 250,
  },
  {
    id: 'streak_7',
    title: 'Streak Master',
    description: 'Maintain an active daily play streak of 7 days.',
    icon: '👑',
    unlocked: false,
    rewardCoins: 300,
  },
];
