export const truncateString = (string = '', maxLength = 15) => {
  if (string.length <= maxLength) {
    return string;
  }
  return string.slice(0, maxLength - 3) + '...';
};

export const formatUserAddress = (address) => {
  if (address.length <= 10) {
    return address;
  }
  return address.slice(0, 6) + '...' + address.slice(-4);
};
