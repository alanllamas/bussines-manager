// General-purpose utility helpers shared across the codebase.

// YEAR_BASE — used in CURP century disambiguation.
// If a 2-digit CURP year + 2000 exceeds the current year, the person was born in the 1900s.
const YEAR_BASE = 2000;

// deepMerge — recursively merges source into target, mutating target.
// Used by the three fetcher variants to merge default headers with caller-provided RequestInit.
// Nested objects (e.g. headers) are merged recursively; scalar values overwrite.
// @ts-expect-error comments are pending cleanup (ADR-003 — eliminate type suppressions).
export const deepMerge = (target: object, source: object) => {
  for (const key in source) {
      // @ts-expect-error missing type
    if (source[key] instanceof Object && key in target) {
      // @ts-expect-error missing type
      target[key] = deepMerge(target[key], source[key]);
    } else {
      // @ts-expect-error missing type
      target[key] = source[key];
    }
  }
  return target;
};

// toBoolean — converts string env var values to boolean.
// Boolean env vars (e.g. NEXT_PUBLIC_FEATURE_FLAG=true) are always strings in process.env.
// Returns defaultValue if value is undefined (env var not set).
export const toBoolean = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

// validateAdultFromCurp — validates that a CURP belongs to a person aged 18 or older.
// CURP format: AAAA YYMMDD HXXXXX NN — birthdate is embedded at positions 4-9 (YYMMDD).
// Century disambiguation: Mexican CURP uses 2-digit years. The algorithm checks whether
// year + 2000 exceeds the current year — if so, the person was born in the 1900s (1900+year),
// otherwise in the 2000s (2000+year). This matches the official RENAPO algorithm.
// Returns false if the CURP format is invalid (regex check).
export const validateAdultFromCurp = (curp: string): boolean => {
  if (!/^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/.test(curp)) {
    return false;
  }

  let year = parseInt(curp.substring(4, 6));
  const month = parseInt(curp.substring(6, 8)) - 1; // Date months are 0-indexed
  const day = parseInt(curp.substring(8, 10));
  const now = new Date();

  // If year + 2000 is in the future, the person was born in the 20th century (1900s).
  if (year + YEAR_BASE > now.getFullYear()) {
    year = year + 1900;
  } else {
    year = year + 2000;
  }

  const birthDate = new Date(year, month, day);
  const miliSecondsDif = now.getTime() - birthDate.getTime();
  // 365.25 accounts for leap years in the age calculation.
  const milisecondsInOneYear = 1000 * 60 * 60 * 24 * 365.25;
  const age = Math.floor(miliSecondsDif / milisecondsInOneYear);

  return age >= 18;
};

// validateTypePersonByRfc — determines person type from RFC length.
// Mexican RFC: moral persons (companies) have 12 characters; physical persons have 13.
// Returns 2 for moral person (empresa), 1 for physical person (persona física).
// Used to pre-select the person type dropdown in billing/tax forms.
export const validateTypePersonByRfc = (rfc: string) =>
  rfc.length === 12 ? 2 : 1;
