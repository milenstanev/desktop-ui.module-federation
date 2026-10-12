import { render, screen } from '@testing-library/react';
import SimpleExample from '~/features/SimpleExample/SimpleExample';

const EXPECTED_TEXT = 'Simple Example Component';

describe('SimpleExample', () => {
  it('renders simple example text', () => {
    render(<SimpleExample />);
    expect(screen.getByText(EXPECTED_TEXT)).toBeInTheDocument();
  });
});
