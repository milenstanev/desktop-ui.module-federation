import { Component, ErrorInfo, ReactNode } from 'react';
import { ERROR_BOUNDARY_STRINGS } from '~/shared/constants';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ERROR_BOUNDARY_FALLBACK_CLASS = 'error-boundary-fallback';
const ALERT_ROLE = 'alert';

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      ERROR_BOUNDARY_STRINGS.CONSOLE_ERROR_PREFIX,
      error,
      errorInfo
    );
    this.setState({ hasError: true, error });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      return (
        <div role={ALERT_ROLE} className={ERROR_BOUNDARY_FALLBACK_CLASS}>
          <h2>{ERROR_BOUNDARY_STRINGS.TITLE}</h2>
          {error && <p>{error.toString()}</p>}
          <button type="button" onClick={this.handleReset}>
            {ERROR_BOUNDARY_STRINGS.BUTTON_TRY_AGAIN}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
