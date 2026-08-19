export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase() // 👈 1. Ubah semua ke huruf kecil dulu
    .replace(/\b\w/g, (char) => char.toUpperCase()); // 👈 2. Pakai \b\w (dengan backslash)
};
