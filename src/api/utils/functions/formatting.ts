import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale/es';

const REGEX_MATCH_ONLY_NUMBERS = /\d+/g;
const REGEX_REMOVE_SYMBOL_SPACES = /[$ ]/gi;

const formatter = Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

/**
 * Format a price to a currency format
 * @param price {string | number} - The price to format
 * @returns {string} - The formatted price
 */
export const formatPrice = (price: string | number): string => {
  if (typeof price === 'string') {
    const match = price.match(REGEX_MATCH_ONLY_NUMBERS);
    const extractedValue = match ? match[0] : '';
    return formatter.format(Number(extractedValue));
  }
  return formatter.format(price);
};

/**
 * Extract the price value from a string
 * @param price { string } - The price to extract
 * @returns { number | [number, number] | null } - The extracted price
 */
export const gettingPriceValue = (price: string): number | Array<number> => {
      // @ts-expect-error missing type
  if (!price) return null;
  if (/sin costo/i.test(price)) return 0;

  // If the price is a range with a hyphen
  // Example: $100 - $200
  if (price.includes('-')) {
    const prices = price
      .split('-')
      .map((p) => Number(p.replace(REGEX_REMOVE_SYMBOL_SPACES, '')));
    return prices;
  }

  // If the price has a symbol or spaces
  return Number(price.replace(REGEX_REMOVE_SYMBOL_SPACES, ''));
};

/**
 *
 * @param date { string } - date to format
 * @param formatString { string } - format to transform the date
 * @returns { strng } - date formatted
 */
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

/**
 *
 * @param str { string } - string to transform
 * @returns { string } - new transformed string
 */
export const capitalizeString = (date: string): string =>
  date.charAt(0).toUpperCase() + date.slice(1);

/**
 *
 * @param date { string }: date to transform
 * @returns { string }: new transformed string
 */
export const formatTransactionPayDate = (date: string) =>
  dateFormat(parse(date, 'dd/MM/yyyy', new Date()), 'dd/MMM/yyyy').replace(
    /\/([a-z]+)\//i,
    (_, mes) => `/${capitalizeString(mes)}/`
  );
