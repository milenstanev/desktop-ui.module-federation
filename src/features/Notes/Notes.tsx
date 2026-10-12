import React, { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '~/core/hooks';
import { RootState } from '~/core/store';
import useLazyLoadReducer from '~/core/hooks/useLazyLoadReducer';
import featureReducer, { addNote, removeNote } from './NotesSlice';
import styles from './Notes.module.css';
import { NOTES_STRINGS, FORM_TYPES } from '~/shared/constants';
import { TEST_SELECTORS, getNoteItemTestId } from '~/shared/testSelectors';

const EMPTY_ITEMS: string[] = [];

interface NotesProps {
  windowId: string;
  windowName: string;
  lazyLoadReducerName: string;
}

const Notes: React.FC<NotesProps> = ({ lazyLoadReducerName }) => {
  //region states
  const items = useAppSelector(
    (state: RootState) =>
      (state[lazyLoadReducerName] as { items?: string[] } | undefined)?.items ??
      EMPTY_ITEMS
  );
  const [input, setInput] = useState('');
  //endregion

  //region hooks
  useLazyLoadReducer({ lazyLoadReducerName, featureReducer });
  const dispatch = useAppDispatch();
  //endregion

  //region callbacks
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(addNote(input));
      setInput('');
    },
    [dispatch, input]
  );
  //endregion

  return (
    <div className={styles.notes} data-testid={TEST_SELECTORS.NOTES_CONTAINER}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type={FORM_TYPES.TEXT}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={NOTES_STRINGS.PLACEHOLDER}
          aria-label={NOTES_STRINGS.NEW_NOTE_ARIA_LABEL}
          className={styles.input}
        />
        <button type="submit" aria-label={NOTES_STRINGS.ADD_ARIA_LABEL}>
          {NOTES_STRINGS.ADD_BUTTON}
        </button>
      </form>
      <ul
        className={styles.list}
        aria-label={NOTES_STRINGS.NOTES_LIST_ARIA_LABEL}
        data-testid={TEST_SELECTORS.NOTES_LIST}
      >
        {items.map((item, i) => (
          <li
            key={`${i}-${item}`}
            className={styles.item}
            data-testid={getNoteItemTestId(i)}
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => dispatch(removeNote(i))}
              aria-label={`${NOTES_STRINGS.REMOVE_NOTE_ARIA_LABEL_PREFIX} ${item}`}
            >
              {NOTES_STRINGS.REMOVE_BUTTON}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
