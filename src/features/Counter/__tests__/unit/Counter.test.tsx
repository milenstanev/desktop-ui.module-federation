import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '~/core/store';
import Counter from '~/features/Counter/Counter';
import { COUNTER_STRINGS, COMPONENT_NAMES, REDUCER_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const INITIAL_VALUE = '0';
const INCREMENTED_VALUE = '1';
const DECREMENTED_VALUE = '-1';

function renderCounter() {
  const store = setupStore();
  const view = render(
    <Provider store={store}>
      <Counter
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.COUNTER}
        lazyLoadReducerName={REDUCER_NAMES.COUNTER}
      />
    </Provider>
  );
  return { ...view, getStore: () => store };
}

describe('Counter', () => {
  it('renders counter with increment and decrement buttons', () => {
    renderCounter();
    expect(
      screen.getByText(COUNTER_STRINGS.INCREMENT_BUTTON)
    ).toBeInTheDocument();
    expect(
      screen.getByText(COUNTER_STRINGS.DECREMENT_BUTTON)
    ).toBeInTheDocument();
    expect(screen.getByText(INITIAL_VALUE)).toBeInTheDocument();
  });

  it('increments counter when + is clicked', () => {
    renderCounter();
    const incrementButton = screen.getByText(COUNTER_STRINGS.INCREMENT_BUTTON);
    act(() => {
      incrementButton.click();
    });
    expect(screen.getByText(INCREMENTED_VALUE)).toBeInTheDocument();
  });

  it('decrements counter when - is clicked', () => {
    renderCounter();
    const decrementButton = screen.getByText(COUNTER_STRINGS.DECREMENT_BUTTON);
    act(() => {
      decrementButton.click();
    });
    expect(screen.getByText(DECREMENTED_VALUE)).toBeInTheDocument();
  });
});
