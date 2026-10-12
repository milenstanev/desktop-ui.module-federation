import { useEffect } from 'react';

/**
 * Keyboard Shortcuts Hook
 *
 * Provides a reusable hook for handling keyboard shortcuts.
 * Supports Escape and Cmd/Ctrl+W for closing windows.
 *
 * @param onEscape - Callback function to execute when Escape is pressed
 * @param onClose - Callback function to execute when Cmd/Ctrl+W is pressed
 * @param enabled - Whether the shortcuts are enabled (default: true)
 */
export const useKeyboardShortcuts = (
  onEscape?: () => void,
  onClose?: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }

      // Cmd/Ctrl + W
      if ((event.metaKey || event.ctrlKey) && event.key === 'w' && onClose) {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, onClose, enabled]);
};
