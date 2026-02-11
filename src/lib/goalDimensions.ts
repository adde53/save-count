import { SportType } from './sportConfig';

export interface GoalDimension {
  /** Width in cm */
  width: number;
  /** Height in cm */
  height: number;
  /** Aspect ratio width:height for SVG viewBox */
  aspectLabel: string;
}

const GOAL_DIMENSIONS: Record<SportType, GoalDimension> = {
  innebandy: { width: 160, height: 115, aspectLabel: '160×115 cm' },
  fotboll: { width: 732, height: 244, aspectLabel: '7.32×2.44 m' },
  handboll: { width: 300, height: 200, aspectLabel: '3×2 m' },
  ishockey: { width: 183, height: 122, aspectLabel: '183×122 cm' },
  futsal: { width: 300, height: 200, aspectLabel: '3×2 m' },
  lacrosse: { width: 183, height: 183, aspectLabel: '183×183 cm' },
  vattenpoloball: { width: 300, height: 90, aspectLabel: '3×0.9 m' },
};

export const getGoalDimension = (sport: SportType): GoalDimension => {
  return GOAL_DIMENSIONS[sport];
};
