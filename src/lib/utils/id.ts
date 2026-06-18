/**
 * Collision-free id with a readable prefix, e.g. `task-1f2e…`. Uses the
 * platform crypto UUID when available and falls back to time+random for very
 * old browsers / non-secure contexts.
 */
export function generateId(prefix: string = 'id'): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid}`;
}
