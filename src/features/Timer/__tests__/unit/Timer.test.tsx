import { render, screen, act } from '@testing-library/react';
import Timer from '~/features/Timer/Timer';
import { TIMER_STRINGS, COMPONENT_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const BUTTON_ROLE = 'button';
const START_TIMER_BUTTON_REGEX = /start timer/i;
const PAUSE_TIMER_BUTTON_REGEX = /pause timer/i;
const RESET_TIMER_BUTTON_REGEX = /reset timer/i;

describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders timer with 00:00 and controls', () => {
    render(
      <Timer
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.TIMER}
      />
    );
    expect(
      screen.getByTestId(TEST_SELECTORS.TIMER_CONTAINER)
    ).toBeInTheDocument();
    expect(screen.getByRole(TIMER_STRINGS.TIMER_ROLE)).toHaveTextContent(
      TEST_SELECTORS.TIMER_INITIAL_TIME
    );
    expect(
      screen.getByRole(BUTTON_ROLE, { name: START_TIMER_BUTTON_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole(BUTTON_ROLE, { name: PAUSE_TIMER_BUTTON_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole(BUTTON_ROLE, { name: RESET_TIMER_BUTTON_REGEX })
    ).toBeInTheDocument();
  });

  it('starts and increments when Start is clicked', () => {
    render(
      <Timer
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.TIMER}
      />
    );
    act(() => {
      screen.getByRole(BUTTON_ROLE, { name: START_TIMER_BUTTON_REGEX }).click();
    });
    act(() => {
      jest.advanceTimersByTime(TEST_SELECTORS.ADVANCE_TIMER_5_SECONDS);
    });
    expect(screen.getByRole(TIMER_STRINGS.TIMER_ROLE)).toHaveTextContent(
      TEST_SELECTORS.TIMER_AFTER_5_SECONDS
    );
  });

  it('resets to 00:00 when Reset is clicked', () => {
    render(
      <Timer
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.TIMER}
      />
    );
    act(() => {
      screen.getByRole(BUTTON_ROLE, { name: START_TIMER_BUTTON_REGEX }).click();
    });
    act(() => {
      jest.advanceTimersByTime(TEST_SELECTORS.ADVANCE_TIMER_3_SECONDS);
    });
    act(() => {
      screen.getByRole(BUTTON_ROLE, { name: RESET_TIMER_BUTTON_REGEX }).click();
    });
    expect(screen.getByRole(TIMER_STRINGS.TIMER_ROLE)).toHaveTextContent(
      TEST_SELECTORS.TIMER_INITIAL_TIME
    );
  });
});
