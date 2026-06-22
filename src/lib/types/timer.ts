export type PomodoroModeType = 'focus' | 'shortBreak' | 'longBreak';

export type TimerStateType = {
  currentMode: PomodoroModeType;
  remainingSeconds: number;
  isRunning: boolean;
  focusSessionCount: number;
};

export type SessionCompleteCallbackType = (
  mode: PomodoroModeType,
  startTime: Date,
  endTime: Date,
  isCompleted: boolean
) => void;

/** Serializable timer state, persisted so a reload can resume a live session. */
export type TimerSnapshotType = {
  currentMode: PomodoroModeType;
  focusSessionCount: number;
  isRunning: boolean;
  deadline: number | null;
  modeStartTime: string | null;
};

/** Outcome of evaluating a persisted snapshot: whether to resume, and with how many seconds left. */
export type TimerRecoveryType = {
  resume: boolean;
  remainingSeconds: number;
};
