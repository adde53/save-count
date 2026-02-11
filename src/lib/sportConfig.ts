export type SportType = 'innebandy' | 'fotboll' | 'handboll' | 'ishockey' | 'futsal' | 'lacrosse' | 'vattenpoloball';

export interface SportConfig {
  id: SportType;
  name: string;
  periodName: string;
  periodCount: number;
  emoji: string;
}

export const SPORTS: SportConfig[] = [
  {
    id: 'innebandy',
    name: 'Innebandy',
    periodName: 'Period',
    periodCount: 3,
    emoji: '🏑',
  },
  {
    id: 'fotboll',
    name: 'Fotboll',
    periodName: 'Halvlek',
    periodCount: 2,
    emoji: '⚽',
  },
  {
    id: 'handboll',
    name: 'Handboll',
    periodName: 'Halvlek',
    periodCount: 2,
    emoji: '🤾',
  },
  {
    id: 'ishockey',
    name: 'Ishockey',
    periodName: 'Period',
    periodCount: 3,
    emoji: '🏒',
  },
  {
    id: 'futsal',
    name: 'Futsal',
    periodName: 'Halvlek',
    periodCount: 2,
    emoji: '⚽',
  },
  {
    id: 'lacrosse',
    name: 'Lacrosse',
    periodName: 'Quarter',
    periodCount: 4,
    emoji: '🥍',
  },
  {
    id: 'vattenpoloball',
    name: 'Vattenpolo',
    periodName: 'Period',
    periodCount: 4,
    emoji: '🤽',
  },
];

export const getSportConfig = (sportId: SportType): SportConfig => {
  return SPORTS.find(s => s.id === sportId) || SPORTS[0];
};
