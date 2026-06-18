export type TaskType = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  focusSessionsSpent: number;
};
