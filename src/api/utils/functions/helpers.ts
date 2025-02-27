const YEAR_BASE = 2000;

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

export const toBoolean = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true';
};

export const validateAdultFromCurp = (curp: string): boolean => {
  if (!/^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/.test(curp)) {
    return false;
  }

  let year = parseInt(curp.substring(4, 6));
  const month = parseInt(curp.substring(6, 8)) - 1;
  const day = parseInt(curp.substring(8, 10));
  const now = new Date();

  if (year + YEAR_BASE > now.getFullYear()) {
    year = year + 1900;
  } else {
    year = year + 2000;
  }

  const birthDate = new Date(year, month, day);
  const miliSecondsDif = now.getTime() - birthDate.getTime();
  const milisecondsInOneYear = 1000 * 60 * 60 * 24 * 365.25;
  const age = Math.floor(miliSecondsDif / milisecondsInOneYear);

  return age >= 18;
};

export const validateTypePersonByRfc = (rfc: string) =>
  rfc.length === 12 ? 2 : 1;
