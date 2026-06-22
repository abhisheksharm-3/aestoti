const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Svelte action for modal dialogs: moves focus inside on mount, keeps Tab /
 * Shift+Tab cycling within the node, and restores focus to whatever was focused
 * before the dialog opened. Apply to a container with `tabindex="-1"`.
 */
export function trapFocus(node: HTMLElement) {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const focusable = () =>
    Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
    );

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (items.length === 0) {
      event.preventDefault();
      node.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !node.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  (focusable()[0] ?? node).focus();
  node.addEventListener('keydown', handleKeydown);

  return {
    destroy(): void {
      node.removeEventListener('keydown', handleKeydown);
      previouslyFocused?.focus?.();
    }
  };
}
