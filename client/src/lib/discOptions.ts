// DISC profile range options for job opening ideal profiles

export const DISC_OPTIONS = [
  { value: '0', label: 'Não relevante', numeric: 0 },
  { value: '25', label: 'Baixo', numeric: 25 },
  { value: '50', label: 'Médio', numeric: 50 },
  { value: '75', label: 'Alto', numeric: 75 },
  { value: '100', label: 'Muito Alto', numeric: 100 },
] as const;

export type DISCOptionValue = typeof DISC_OPTIONS[number]['value'];

/**
 * Maps a numeric DISC value to the closest predefined option
 * Used for hydrating edit forms with existing data
 * @param value - Numeric DISC value (0-100)
 * @returns The closest option value and whether it was approximated
 */
export function mapDiscValueToOption(value: number | undefined | null): {
  optionValue: DISCOptionValue;
  isApproximation: boolean;
} {
  if (value === undefined || value === null) {
    return { optionValue: '0', isApproximation: false };
  }

  // Normalize to number to handle string values from database
  const numericValue = Number(value);

  // Find closest option
  const closest = DISC_OPTIONS.reduce((prev, curr) => {
    return Math.abs(curr.numeric - numericValue) < Math.abs(prev.numeric - numericValue) ? curr : prev;
  });

  const isApproximation = closest.numeric !== numericValue;

  return {
    optionValue: closest.value,
    isApproximation,
  };
}

/**
 * Builds the ideal DISC profile object from selected options
 * @param d - Dominance option value
 * @param i - Influence option value
 * @param s - Steadiness option value
 * @param c - Conformity option value
 * @returns DISC profile object or null if all zero
 */
export function buildIdealDiscProfile(
  d: string,
  i: string,
  s: string,
  c: string
): { D: number; I: number; S: number; C: number } | null {
  const profile = {
    D: parseInt(d),
    I: parseInt(i),
    S: parseInt(s),
    C: parseInt(c),
  };

  // Return null if all dimensions are zero (not relevant)
  const hasNonZero = Object.values(profile).some(v => v > 0);
  return hasNonZero ? profile : null;
}

/**
 * Validates that at least one DISC dimension is non-zero
 * @param d - Dominance option value
 * @param i - Influence option value
 * @param s - Steadiness option value
 * @param c - Conformity option value
 * @returns true if valid (at least one dimension > 0)
 */
export function validateDiscProfile(
  d: string,
  i: string,
  s: string,
  c: string
): boolean {
  return parseInt(d) > 0 || parseInt(i) > 0 || parseInt(s) > 0 || parseInt(c) > 0;
}
