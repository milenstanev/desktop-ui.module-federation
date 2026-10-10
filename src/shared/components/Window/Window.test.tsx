import { render, screen } from '@testing-library/react';
import Window from './Window';
import { WINDOW_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const noop = () => {};

const TEST_WINDOW_IDS = {
  W1: 'w1',
} as const;

const TEST_WINDOW_NAMES = {
  MY_WINDOW: 'My Window',
  W: 'W',
} as const;

const TEST_CONTENT = {
  CONTENT: 'Content',
  CONTENT_TEXT: 'Content text',
} as const;

const WINDOW_ROLE_REGEX = /window/i;

describe('Window', () => {
  it('renders name and children', () => {
    render(
      <Window
        id={TEST_WINDOW_IDS.W1}
        name={TEST_WINDOW_NAMES.MY_WINDOW}
        removeWindow={noop}
      >
        <span>{TEST_CONTENT.CONTENT}</span>
      </Window>
    );
    expect(screen.getByText(TEST_WINDOW_NAMES.MY_WINDOW)).toBeInTheDocument();
    expect(screen.getByText(TEST_CONTENT.CONTENT)).toBeInTheDocument();
  });

  it('applies focused class when isFocused', () => {
    render(
      <Window
        id={TEST_WINDOW_IDS.W1}
        name={TEST_WINDOW_NAMES.W}
        removeWindow={noop}
        isFocused
      >
        <span>{TEST_CONTENT.CONTENT}</span>
      </Window>
    );
    const windowEl = screen.getByRole(TEST_SELECTORS.WINDOW_ROLE, {
      name: WINDOW_ROLE_REGEX,
    });
    expect(windowEl.className).toMatch(
      new RegExp(TEST_SELECTORS.FOCUSED_CLASS)
    );
  });

  it('does not apply focused class when not focused', () => {
    render(
      <Window
        id={TEST_WINDOW_IDS.W1}
        name={TEST_WINDOW_NAMES.W}
        removeWindow={noop}
        isFocused={false}
      >
        <span>{TEST_CONTENT.CONTENT}</span>
      </Window>
    );
    const windowEl = screen.getByRole(TEST_SELECTORS.WINDOW_ROLE, {
      name: WINDOW_ROLE_REGEX,
    });
    expect(windowEl.className).not.toMatch(
      new RegExp(TEST_SELECTORS.FOCUSED_CLASS)
    );
  });

  it('calls removeWindow when Remove button is clicked', () => {
    const removeWindow = jest.fn();
    render(
      <Window
        id={TEST_WINDOW_IDS.W1}
        name={TEST_WINDOW_NAMES.W}
        removeWindow={removeWindow}
      >
        <span>{TEST_CONTENT.CONTENT}</span>
      </Window>
    );
    screen.getByLabelText(WINDOW_STRINGS.CLOSE_ARIA_LABEL).click();
    expect(removeWindow).toHaveBeenCalledWith(TEST_WINDOW_IDS.W1);
  });

  it('calls onFocus when clicking window content', () => {
    const onFocus = jest.fn();
    render(
      <Window
        id={TEST_WINDOW_IDS.W1}
        name={TEST_WINDOW_NAMES.W}
        removeWindow={noop}
        onFocus={onFocus}
      >
        <span>{TEST_CONTENT.CONTENT_TEXT}</span>
      </Window>
    );
    const content = screen.getByText(TEST_CONTENT.CONTENT_TEXT);
    content.click();
    expect(onFocus).toHaveBeenCalledWith(TEST_WINDOW_IDS.W1);
  });
});
