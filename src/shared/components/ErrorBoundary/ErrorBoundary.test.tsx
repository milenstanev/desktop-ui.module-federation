import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { ERROR_BOUNDARY_STRINGS } from '~/shared/constants';

const TEST_ERROR_MESSAGE = 'Test error';
const TEST_CHILD_CONTENT = 'Child content';
const BUTTON_ROLE = 'button';
const TRY_AGAIN_BUTTON_REGEX = /try again/i;
const CONSOLE_METHOD = 'error';

const Throw = () => {
  throw new Error(TEST_ERROR_MESSAGE);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, CONSOLE_METHOD).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <span>{TEST_CHILD_CONTENT}</span>
      </ErrorBoundary>
    );
    expect(screen.getByText(TEST_CHILD_CONTENT)).toBeInTheDocument();
  });

  it('renders fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>
    );
    expect(screen.getByText(ERROR_BOUNDARY_STRINGS.TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole(BUTTON_ROLE, { name: TRY_AGAIN_BUTTON_REGEX })
    ).toBeInTheDocument();
  });

  it('calls onReset when Try again is clicked', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <Throw />
      </ErrorBoundary>
    );
    screen.getByRole(BUTTON_ROLE, { name: TRY_AGAIN_BUTTON_REGEX }).click();
    expect(onReset).toHaveBeenCalled();
  });
});
