const OPENING_BALANCE_REGEX = /^-?(?:\d+|\d*\.\d{1,2})$/;

export interface OpeningBalanceValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

export const validateOpeningBalanceInput = (rawValue: string): OpeningBalanceValidationResult => {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Opening balance is required' };
  }

  if (!OPENING_BALANCE_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Use a valid number with up to 2 decimals' };
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { isValid: false, error: 'Enter a valid numeric value' };
  }

  return { isValid: true, value: Number(parsed.toFixed(2)) };
};

export const formatOpeningBalanceForDisplay = (value: number | string): string => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed.toFixed(2);
};
