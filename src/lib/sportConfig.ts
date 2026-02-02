export type SportType = 'innebandy' | 'fotboll' | 'handboll' | 'ishockey';

export interface SportConfig {
  id: SportType;
  name: string;
  periodName: string;
  periodCount: number;
}

export const SPORTS: SportConfig[] = [
  {
    id: 'innebandy',
    name: 'Innebandy',
    periodName: 'Period',
    periodCount: 3,
  },
  {
    id: 'fotboll',
    name: 'Fotboll',
    periodName: 'Halvlek',
    periodCount: 2,
  },
  {
    id: 'handboll',
    name: 'Handboll',
    periodName: 'Halvlek',
    periodCount: 2,
  },
  {
    id: 'ishockey',
    name: 'Ishockey',
    periodName: 'Period',
    periodCount: 3,
  },
];

export const getSportConfig = (sportId: SportType): SportConfig => {
  return SPORTS.find(s => s.id === sportId) || SPORTS[0];
};
