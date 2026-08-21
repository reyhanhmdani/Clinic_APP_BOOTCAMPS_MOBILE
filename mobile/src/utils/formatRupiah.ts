// export const formattedTotal = new Intl.NumberFormat("id-ID", {
//   style: "currency",
//   currency: "IDR",
//   maximumFractionDigits: 0,
// }).format(totalAmount);

export const formatRupiah = (amount: number = 0): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};
