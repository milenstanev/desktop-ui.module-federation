import { render, screen, waitFor, act } from '@testing-library/react';
import { DASHBOARD_DATA_SYNC_EVENT } from '~/app-shell/iframeBridge/protocol';
import RemoteFeatureLoader from '~/app-shell/RemoteFeatureLoader';
import {
  MICRO_FRONTEND_STRINGS,
  REMOTE_FEATURE_NAMES,
} from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';
import { loadRemoteFeature } from '~/app-shell/loadRemoteFeature';
import { getFeature } from '~/core/feature-registry';

jest.mock('~/app-shell/loadRemoteFeature', () => ({
  loadRemoteFeature: jest.fn(),
}));

jest.mock('~/core/feature-registry', () => ({
  getFeature: jest.fn(),
}));

jest.mock('~/shared/components/Loader/Loader', () => ({
  __esModule: true,
  default: () => <div role="status">Loading...</div>,
}));

const mockLoadRemoteFeature = loadRemoteFeature as jest.MockedFunction<
  typeof loadRemoteFeature
>;
const mockGetFeature = getFeature as jest.MockedFunction<typeof getFeature>;

let schemaUiMounts = 0;

const RemoteStub: React.FC<{ windowName: string }> = ({ windowName }) => {
  schemaUiMounts += 1;
  return (
    <div>
      {windowName}
      <span data-testid="schema-ui-mounts">{schemaUiMounts}</span>
    </div>
  );
};

describe('RemoteFeatureLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    schemaUiMounts = 0;
    mockGetFeature.mockReturnValue(undefined);
  });

  it('loads the remote on mount and renders it', async () => {
    mockLoadRemoteFeature.mockResolvedValue({
      name: 'analytics',
      displayName: 'Analytics',
      component: RemoteStub,
    });

    render(
      <RemoteFeatureLoader
        remoteFeatureName="analytics"
        windowId="w1"
        windowName="Analytics"
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
    expect(mockLoadRemoteFeature).toHaveBeenCalledWith('analytics');
  });

  it('wraps schema-ui remotes in the compact host', async () => {
    mockLoadRemoteFeature.mockResolvedValue({
      name: REMOTE_FEATURE_NAMES.SCHEMA_UI,
      displayName: 'Forms',
      component: RemoteStub,
    });

    render(
      <RemoteFeatureLoader
        remoteFeatureName={REMOTE_FEATURE_NAMES.SCHEMA_UI}
        windowId="w-forms"
        windowName="Forms"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Forms')).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(TEST_SELECTORS.SCHEMA_UI_HOST)
    ).toBeInTheDocument();
  });

  it('remounts schema-ui when the dashboard syncs from an iframe', async () => {
    mockLoadRemoteFeature.mockResolvedValue({
      name: REMOTE_FEATURE_NAMES.SCHEMA_UI,
      displayName: 'Forms',
      component: RemoteStub,
    });

    render(
      <RemoteFeatureLoader
        remoteFeatureName={REMOTE_FEATURE_NAMES.SCHEMA_UI}
        windowId="w-forms"
        windowName="Forms"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Forms')).toBeInTheDocument();
    });
    expect(screen.getByTestId('schema-ui-mounts')).toHaveTextContent('1');

    act(() => {
      window.dispatchEvent(new CustomEvent(DASHBOARD_DATA_SYNC_EVENT));
    });

    expect(screen.getByTestId('schema-ui-mounts')).toHaveTextContent('2');
  });

  it('shows an alert when the remote fails to load', async () => {
    mockLoadRemoteFeature.mockRejectedValue(
      new Error('Remote "analytics" container not found')
    );

    render(
      <RemoteFeatureLoader
        remoteFeatureName="analytics"
        windowId="w1"
        windowName="Analytics"
      />
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(MICRO_FRONTEND_STRINGS.LOAD_FAILED_MIDDLE);
    expect(alert).toHaveTextContent('Remote "analytics" container not found');
  });
});
