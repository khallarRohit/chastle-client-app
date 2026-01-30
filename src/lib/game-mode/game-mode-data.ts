/**
 * Game Modes Data
 * Central configuration for all available game modes
 */

export interface GameMode {
  id: string
  time: string
  increment: string
  category: string
  isCustom?: boolean
}

export const gameModes = {
  quickPairing: [
    { id: 'bullet-1-0', time: '1', increment: '0', category: 'Bullet' },
    { id: 'bullet-2-1', time: '2', increment: '1', category: 'Bullet' },
    { id: 'blitz-3-0', time: '3', increment: '0', category: 'Blitz' },
    { id: 'blitz-3-2', time: '3', increment: '2', category: 'Blitz' },
    { id: 'blitz-5-0', time: '5', increment: '0', category: 'Blitz' },
    { id: 'blitz-5-3', time: '5', increment: '3', category: 'Blitz' },
    { id: 'rapid-10-0', time: '10', increment: '0', category: 'Rapid' },
    { id: 'rapid-10-5', time: '10', increment: '5', category: 'Rapid' },
    { id: 'rapid-15-10', time: '15', increment: '10', category: 'Rapid' },
    { id: 'classical-30-0', time: '30', increment: '0', category: 'Classical' },
    { id: 'classical-30-20', time: '30', increment: '20', category: 'Classical' },
  ],
  lobby: [
    { id: 'bullet-1-0', time: '1', increment: '0', category: 'Bullet' },
    { id: 'bullet-2-1', time: '2', increment: '1', category: 'Bullet' },
    { id: 'blitz-3-0', time: '3', increment: '0', category: 'Blitz' },
    { id: 'blitz-3-2', time: '3', increment: '2', category: 'Blitz' },
    { id: 'blitz-5-0', time: '5', increment: '0', category: 'Blitz' },
    { id: 'blitz-5-3', time: '5', increment: '3', category: 'Blitz' },
    { id: 'rapid-10-0', time: '10', increment: '0', category: 'Rapid' },
    { id: 'rapid-10-5', time: '10', increment: '5', category: 'Rapid' },
    { id: 'rapid-15-10', time: '15', increment: '10', category: 'Rapid' },
    { id: 'classical-30-0', time: '30', increment: '0', category: 'Classical' },
    { id: 'classical-30-20', time: '30', increment: '20', category: 'Classical' },
    { id: 'custom', time: '', increment: '', category: 'Custom', isCustom: true },
  ],
  correspondence: [
    { id: 'corr-1-0', time: '1', increment: '0', category: 'Day' },
    { id: 'corr-3-0', time: '3', increment: '0', category: 'Days' },
    { id: 'corr-5-0', time: '5', increment: '0', category: 'Days' },
    { id: 'corr-7-0', time: '7', increment: '0', category: 'Week' },
    { id: 'corr-10-0', time: '10', increment: '0', category: 'Days' },
    { id: 'corr-14-0', time: '14', increment: '0', category: 'Weeks' },
  ],
}

export type GameModeCategory = keyof typeof gameModes