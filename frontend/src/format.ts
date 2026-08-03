export const formatNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return Number(digits).toLocaleString('en-US');
};

export const formatBirr = (value: string) => {
  if (!value) {
    return value;
  }
  const cleaned = formatNumber(value.replace(/[^0-9]/g, ''));
  return cleaned ? `ETB ${cleaned}` : value;
};
