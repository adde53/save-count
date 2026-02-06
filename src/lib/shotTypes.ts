export type ShotOutcome = 'save' | 'goal' | 'on_target' | 'off_target';

export interface ShotEvent {
  id: string;
  team: 'home' | 'away';
  period: number;
  outcome: ShotOutcome;
  positionX?: number; // 0-1 percentage on goal
  positionY?: number; // 0-1 percentage on goal
  timestamp: string;
}

export const OUTCOME_CONFIG: Record<ShotOutcome, { label: string; emoji: string; color: string }> = {
  save: { label: 'Räddning', emoji: '🧤', color: 'hsl(142, 71%, 45%)' },
  goal: { label: 'Mål', emoji: '⚽', color: 'hsl(0, 84%, 60%)' },
  on_target: { label: 'På mål', emoji: '🎯', color: 'hsl(48, 96%, 53%)' },
  off_target: { label: 'Utanför', emoji: '↗️', color: 'hsl(215, 20%, 50%)' },
};
