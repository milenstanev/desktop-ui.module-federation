import React from 'react';
import { useAppDispatch, useAppSelector } from '~/core/hooks';
import { RootState } from '~/core/store';
import featureReducer, { decrement, increment } from './CounterSlice';
import useLazyLoadReducer from '~/core/hooks/useLazyLoadReducer';
import { COUNTER_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import styles from './Counter.module.css';

interface CounterProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName: string;
}

const Counter: React.FC<CounterProps> = ({ lazyLoadReducerName }) => {
  //region states
  const value = useAppSelector(
    (state: RootState) => state[lazyLoadReducerName]?.value || 0
  );
  //endregion

  //region hooks
  useLazyLoadReducer({
    lazyLoadReducerName,
    featureReducer,
  });
  const dispatch = useAppDispatch();
  //endregion

  return (
    <div
      className={styles.container}
      data-testid={TEST_SELECTORS.COUNTER.CONTAINER}
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => dispatch(decrement())}
        aria-label={COUNTER_STRINGS.DECREMENT_BUTTON}
        data-testid={TEST_SELECTORS.COUNTER.DECREMENT_BUTTON}
      >
        {COUNTER_STRINGS.DECREMENT_BUTTON}
      </button>
      <div
        className={styles.value}
        role="status"
        aria-live="polite"
        aria-label="Counter value"
        data-testid={TEST_SELECTORS.COUNTER.VALUE}
      >
        {value}
      </div>
      <button
        type="button"
        className={styles.button}
        onClick={() => dispatch(increment())}
        aria-label={COUNTER_STRINGS.INCREMENT_BUTTON}
        data-testid={TEST_SELECTORS.COUNTER.INCREMENT_BUTTON}
      >
        {COUNTER_STRINGS.INCREMENT_BUTTON}
      </button>
    </div>
  );
};

export default Counter;
