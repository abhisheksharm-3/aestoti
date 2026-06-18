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
