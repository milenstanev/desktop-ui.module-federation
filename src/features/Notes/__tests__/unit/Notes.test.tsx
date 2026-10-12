import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { setupStore } from '~/core/store';
import Notes from '~/features/Notes/Notes';
import { NOTES_STRINGS, COMPONENT_NAMES, REDUCER_NAMES } from '~/shared/constants';
import { TEST_SELECTORS } from '~/shared/testSelectors';

const BUTTON_ROLE = 'button';
const ADD_NOTE_BUTTON_REGEX = /add note/i;
const REMOVE_NOTE_BUTTON_REGEX = /remove note: to remove/i;
const ITEMS_PROPERTY = 'items';

function renderNotes() {
  const store = setupStore();
  const view = render(
    <Provider store={store}>
      <Notes
        windowId={TEST_SELECTORS.WINDOW_ID_W1}
        windowName={COMPONENT_NAMES.NOTES}
        lazyLoadReducerName={REDUCER_NAMES.NOTES}
      />
    </Provider>
  );
  return { ...view, getStore: () => store };
}

describe('Notes', () => {
  it('renders notes feature with input and add button', () => {
    renderNotes();
    expect(
      screen.getByTestId(TEST_SELECTORS.NOTES_CONTAINER)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(NOTES_STRINGS.PLACEHOLDER)
    ).toBeInTheDocument();
    expect(
      screen.getByRole(BUTTON_ROLE, { name: ADD_NOTE_BUTTON_REGEX })
    ).toBeInTheDocument();
  });

  it('adds a note when submitting the form', async () => {
    const { getStore } = renderNotes();
    await userEvent.type(
      screen.getByPlaceholderText(NOTES_STRINGS.PLACEHOLDER),
      TEST_SELECTORS.TEST_NOTE_MY_FIRST
    );
    await userEvent.click(
      screen.getByRole(BUTTON_ROLE, { name: ADD_NOTE_BUTTON_REGEX })
    );
    expect(
      screen.getByText(TEST_SELECTORS.TEST_NOTE_MY_FIRST)
    ).toBeInTheDocument();
    expect(
      getStore().getState()[REDUCER_NAMES.NOTES]?.[ITEMS_PROPERTY]
    ).toEqual([TEST_SELECTORS.TEST_NOTE_MY_FIRST]);
  });

  it('removes a note when clicking Remove', async () => {
    const { getStore } = renderNotes();
    await userEvent.type(
      screen.getByPlaceholderText(NOTES_STRINGS.PLACEHOLDER),
      TEST_SELECTORS.TEST_NOTE_TO_REMOVE
    );
    await userEvent.click(
      screen.getByRole(BUTTON_ROLE, { name: ADD_NOTE_BUTTON_REGEX })
    );
    await userEvent.click(
      screen.getByRole(BUTTON_ROLE, { name: REMOVE_NOTE_BUTTON_REGEX })
    );
    expect(
      screen.queryByText(TEST_SELECTORS.TEST_NOTE_TO_REMOVE)
    ).not.toBeInTheDocument();
    expect(
      getStore().getState()[REDUCER_NAMES.NOTES]?.[ITEMS_PROPERTY]
    ).toEqual([]);
  });
});
