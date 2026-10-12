import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Timer.module.css';
import { TIMER_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

interface TimerProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName?: string;
}

const INTERVAL_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const PAD_LENGTH = 2;
const PAD_CHAR = '0';
const TIME_SEPARATOR = ':';

const Timer: React.FC<TimerProps> = () => {
  //region states
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  //endregion

  //region hooks
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  //endregion

  //region callbacks
  const handleStart = useCallback(() => setRunning(true), []);
  const handlePause = useCallback(() => setRunning(false), []);
  const handleReset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
  }, []);
  //endregion

  const formatTime = (s: number) => {
    const m = Math.floor(s / SECONDS_PER_MINUTE);
    const sec = s % SECONDS_PER_MINUTE;
    return `${m.toString().padStart(PAD_LENGTH, PAD_CHAR)}${TIME_SEPARATOR}${sec.toString().padStart(PAD_LENGTH, PAD_CHAR)}`;
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <div className={styles.timer} data-testid={TEST_SELECTORS.TIMER_CONTAINER}>
      <div
        className={styles.display}
        role={TIMER_STRINGS.TIMER_ROLE}
        aria-live={TIMER_STRINGS.TIMER_ARIA_LIVE}
      >
        {formatTime(seconds)}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleStart}
          disabled={running}
          aria-label={TIMER_STRINGS.START_ARIA_LABEL}
        >
          {TIMER_STRINGS.START_BUTTON}
        </button>
        <button
          type="button"
          onClick={handlePause}
          disabled={!running}
          aria-label={TIMER_STRINGS.PAUSE_ARIA_LABEL}
        >
          {TIMER_STRINGS.PAUSE_BUTTON}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label={TIMER_STRINGS.RESET_ARIA_LABEL}
        >
          {TIMER_STRINGS.RESET_BUTTON}
        </button>
      </div>
    </div>
  );
};

export default Timer;
