// ─────────────────────────────────────────────────────────────────────────────
// src/utils/helpers.ts
// Pure utility functions — no side effects, fully tree-shakeable.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a raw minute count to a human-readable duration string.
 * @example formatMinutes(82)  → "1h 22m"
 * @example formatMinutes(18)  → "18m"
 */
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a localised short date.
 * @example formatDate('2026-06-14') → "14 Jun 2026"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Generates a short random collision-resistant ID (not cryptographically secure).
 * Suitable for client-side temporary IDs before a backend assigns a real one.
 * @example generateId() → "lf2k4j9x8z2"
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * Rounds a number to a given number of decimal places.
 * @example round(34.2567, 1) → 34.3
 */
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

/**
 * Clamps a number between a min and max value.
 * @example clamp(110, 0, 100) → 100
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
