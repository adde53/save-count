import { SportType } from './sportConfig';

export interface PeriodCounts {
  home: number;
  away: number;
}

export interface HistoryEntry {
  team: 'home' | 'away';
  action: 'add';
  period: number;
}

export interface MatchState {
  sport: SportType;
  currentPeriod: number;
  periods: PeriodCounts[];
  history: HistoryEntry[];
  homeTeamName: string;
  awayTeamName: string;
  createdAt: string;
}

export interface SavedMatch extends MatchState {
  id: string;
  savedAt: string;
}

export const createEmptyMatch = (sport: SportType, periodCount: number): MatchState => ({
  sport,
  currentPeriod: 0,
  periods: Array.from({ length: periodCount }, () => ({ home: 0, away: 0 })),
  history: [],
  homeTeamName: 'Hemmalag',
  awayTeamName: 'Bortalag',
  createdAt: new Date().toISOString(),
});

export const getTotals = (periods: PeriodCounts[]): PeriodCounts => {
  return periods.reduce(
    (totals, period) => ({
      home: totals.home + period.home,
      away: totals.away + period.away,
    }),
    { home: 0, away: 0 }
  );
};
