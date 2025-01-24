import Decimal from 'decimal.js';

export function shortAddress(address) {
  if (address.length < 14) {
    return address;
  }
  return address.substr(0, 4) + '...' + address.substr(-4);
}

export function formatSol(decimalValue) {
  if (decimalValue === null || decimalValue === undefined) {
    return '0';
  }
  const value = new Decimal(decimalValue);
  const ret = value
    .toDecimalPlaces(9)
    .toString()
    .replace(/\.?0+$/, '');
  return ret || '0';
}

export function formatDate(dateStr) {
  if (!dateStr) {
    return '';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const date = new Date(dateStr);
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
