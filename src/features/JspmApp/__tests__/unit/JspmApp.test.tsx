import { render, screen } from '@testing-library/react';
import JspmApp from '~/features/JspmApp/JspmApp';
import { DEFAULT_JSPM_APP_URL } from '~/features/JspmApp/jspmAppUrl';
import { COMPONENT_NAMES, JSPM_APP_STRINGS } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

describe('JspmApp', () => {
  it('embeds the AngularJS JSPM app in an iframe', () => {
    render(
      <JspmApp
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.JSPM_APP}
      />
    );

    const frame = screen.getByTitle(JSPM_APP_STRINGS.IFRAME_TITLE);
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute('src', DEFAULT_JSPM_APP_URL);
    expect(frame).toHaveAttribute('data-testid', TEST_SELECTORS.JSPM_APP_FRAME);
  });
});
