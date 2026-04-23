/**
 * @param {string} text
 */
export function detectSalaryPeriod(text) {
  const lower = text.toLowerCase();

  if (/(hour|hr|hora|\/h)/i.test(lower)) {
    return "hour";
  }

  if (/(month|monthly|mês|mes|\/m)/i.test(lower)) {
    return "month";
  }

  return "year";
}
