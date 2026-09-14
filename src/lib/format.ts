export function formatEGP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArabicDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
