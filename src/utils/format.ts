
/**
 * Formats a number into a shortened string with suffixes (k, m, b) and 2 decimal places.
 * Examples:
 * 1200 -> 1.20k
 * 1500000 -> 1.50m
 */
export function formatTokenCount(num: number): string {
  if (num < 1000) {
    return num.toFixed(2);
  }
  
  const suffixes = [
    { value: 1e9, symbol: 'b' },
    { value: 1e6, symbol: 'm' },
    { value: 1e3, symbol: 'k' },
  ];

  for (const { value, symbol } of suffixes) {
    if (num >= value) {
      return (num / value).toFixed(2) + symbol;
    }
  }

  return num.toFixed(2);
}
