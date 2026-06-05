import { useEffect } from 'react';

/**
 * Closes a modal on Escape key (or Ctrl+W / Cmd+W as secondary shortcuts).
 * Pass `enabled = false` to suspend the listener while the modal is closed.
 */
export function useModalClose(onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      // Ctrl+W / Cmd+W — common "close tab/panel" shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [enabled, onClose]);
}
