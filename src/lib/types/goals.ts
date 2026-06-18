export type DailyGoalType = {
  targetSessions: number;
  isEnabled: boolean;
};

export type DailyProgressType = {
  completed: number;
  target: number;
  percentage: number;
  isGoalMet: boolean;
};
