export const getToFixedNumber = (value, fixedValue = 2) => {
  if (value) return value === 0 ? 0 : value.toFixed(fixedValue);
  return 0;
};

export const isPositiveInteger = (value) => {
  // Проверяем, является ли значение числом
  if (typeof value !== 'number') {
    return false;
  }

  // Проверяем, является ли число целым
  if (!Number.isInteger(value)) {
    return false;
  }

  // Проверяем, является ли число положительным
  if (value < 0) {
    return false;
  }

  // Если все проверки пройдены, возвращаем true
  return true;
};
