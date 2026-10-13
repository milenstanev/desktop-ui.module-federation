import { render, screen } from '@testing-library/react';
import App from './app/App';
import { APP_TEST } from './shared/constants';

test('renders desktop UI header and add window buttons', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: APP_TEST.HEADING_TITLE })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_SIMPLE_EXAMPLE })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_COUNTER })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_FORM_EDITOR })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_ANALYTICS })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_FORMS })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: APP_TEST.BUTTON_ADD_JSPM_APP })
  ).toBeInTheDocument();
});
