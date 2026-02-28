// Formatting utilities for prices, dates, and strings.
// Used in print formats, list tables, and form display.

import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale/es';

// Regex to extract only digit sequences from a price string (strips $, spaces, decimals).
const REGEX_MATCH_ONLY_NUMBERS = /\d+/g;
// Regex to strip $ symbols and spaces when parsing a price string to a number.
const REGEX_REMOVE_SYMBOL_SPACES = /[$ ]/gi;

// MXN currency formatter using es-MX locale (e.g. "$1,234.56").
const formatter = Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

// formatPrice — formats a numeric or string price as MXN currency.
// If price is a string (e.g. already formatted "$1,234"), extracts the first digit sequence
// and re-formats it. Used in invoice and ticket print formats.
export const formatPrice = (price: string | number): string => {
  if (typeof price === 'string') {
    const match = price.match(REGEX_MATCH_ONLY_NUMBERS);
    const extractedValue = match ? match[0] : '';
    return formatter.format(Number(extractedValue));
  }
  return formatter.format(price);
};

// gettingPriceValue — extracts a numeric value from a formatted price string.
// Returns null if price is empty/falsy (return type says number|Array but null is returned
// via @ts-expect-error — pending ADR-003 cleanup).
// Returns 0 for "sin costo" (free of charge).
// Returns [number, number] for range prices formatted as "$100 - $200".
// Returns a single number for plain prices like "$1,234".
export const gettingPriceValue = (price: string): number | Array<number> => {
      // @ts-expect-error missing type
  if (!price) return null;
  if (/sin costo/i.test(price)) return 0;

  // Range price format: "$100 - $200" — split on hyphen, strip symbols, return both values.
  if (price.includes('-')) {
    const prices = price
      .split('-')
      .map((p) => Number(p.replace(REGEX_REMOVE_SYMBOL_SPACES, '')));
    return prices;
  }

  // Single price — strip $ and spaces, convert to number.
  return Number(price.replace(REGEX_REMOVE_SYMBOL_SPACES, ''));
};

// dateFormat — formats a date string or Date object using date-fns with Spanish locale.
// formatString uses date-fns tokens (e.g. 'dd/MM/yyyy', 'dd MMM yyyy', 'PPP').
// String input is converted to Date via the Date constructor before formatting.
// locale: es ensures month/day names appear in Spanish.
export const dateFormat = (
  date: string | Date,
  formatString: string
): string => {
  if (typeof date === 'string') {
    const internalDate = new Date(date);
    return format(internalDate, formatString, {
      locale: es,
    });
  }

  return format(date, formatString, {
    locale: es,
  });
};

// capitalizeString — uppercases the first character of a string.
// Used by formatTransactionPayDate to capitalize abbreviated month names (e.g. "ene" → "Ene").
export const capitalizeString = (date: string): string =>
  date.charAt(0).toUpperCase() + date.slice(1);

// formatTransactionPayDate — converts a payment date from "dd/MM/yyyy" to "dd/Mmm/yyyy".
// Example: "15/01/2024" → "15/Ene/2024".
// parse() converts the dd/MM/yyyy string to a Date; dateFormat() re-formats as dd/MMM/yyyy;
// the replace() capitalizes the lowercase abbreviated month from date-fns es locale.
export const formatTransactionPayDate = (date: string) =>
  dateFormat(parse(date, 'dd/MM/yyyy', new Date()), 'dd/MMM/yyyy').replace(
    /\/([a-z]+)\//i,
    (_, mes) => `/${capitalizeString(mes)}/`
  );
