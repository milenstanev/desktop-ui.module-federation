// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Suppress specific React act() warnings for async useEffect operations
// These warnings are expected when testing loading states before async operations complete
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args: any[]) => {
    const errorMessage = typeof args[0] === 'string' ? args[0] : '';
    
    // Suppress act() warnings for FormEditor's async useEffect
    // The component properly handles cleanup with isMounted flag
    if (
      errorMessage.includes('Warning: An update to FormEditor inside a test was not wrapped in act')
    ) {
      return;
    }
    
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
