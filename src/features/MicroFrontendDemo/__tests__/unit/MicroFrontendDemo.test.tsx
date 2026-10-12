import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MicroFrontendDemo from '~/features/MicroFrontendDemo/MicroFrontendDemo';
import { MICRO_FRONTEND_STRINGS } from '~/shared/constants';
import {
  loadRemoteFeature,
  getAvailableRemotes,
} from '~/app-shell/loadRemoteFeature';
import { hasFeature } from '~/core/feature-registry';

jest.mock('~/app-shell/loadRemoteFeature', () => ({
  loadRemoteFeature: jest.fn(),
  getAvailableRemotes: jest.fn(() => ['analytics']),
}));

jest.mock('~/core/feature-registry', () => ({
  hasFeature: jest.fn(() => false),
}));

const mockLoadRemoteFeature = loadRemoteFeature as jest.MockedFunction<
  typeof loadRemoteFeature
>;
const mockGetAvailableRemotes = getAvailableRemotes as jest.MockedFunction<
  typeof getAvailableRemotes
>;
const mockHasFeature = hasFeature as jest.MockedFunction<typeof hasFeature>;

describe('MicroFrontendDemo', () => {
  const onOpenRemoteWindow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailableRemotes.mockReturnValue(['analytics']);
    mockHasFeature.mockReturnValue(false);
  });

  it('expands the architecture panel', async () => {
    render(<MicroFrontendDemo onOpenRemoteWindow={onOpenRemoteWindow} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: MICRO_FRONTEND_STRINGS.TOGGLE_ARIA_LABEL,
      })
    );

    expect(
      screen.getByRole('button', {
        name: MICRO_FRONTEND_STRINGS.LOAD_ANALYTICS,
      })
    ).toBeInTheDocument();
  });

  it('loads the analytics remote and opens a window', async () => {
    mockLoadRemoteFeature.mockResolvedValue({
      name: 'analytics',
      displayName: 'Analytics',
      component: () => null,
      reducer: { name: 'analytics', reducer: (state = {}) => state },
    });

    render(<MicroFrontendDemo onOpenRemoteWindow={onOpenRemoteWindow} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: MICRO_FRONTEND_STRINGS.TOGGLE_ARIA_LABEL,
      })
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: MICRO_FRONTEND_STRINGS.LOAD_ANALYTICS,
      })
    );

    expect(mockLoadRemoteFeature).toHaveBeenCalledWith('analytics');
    await waitFor(() => {
      expect(onOpenRemoteWindow).toHaveBeenCalledWith({
        displayName: 'Analytics',
        name: 'analytics',
        reducerName: 'analytics',
      });
    });
  });
});
