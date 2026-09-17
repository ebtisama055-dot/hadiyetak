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

/**
 * Builds a wa.me link from a number as entered in Admin Settings (local
 * Egyptian format like 01557845766, or already-international like
 * 201557845766) — normalizes it so the floating button and footer link
 * always point at a valid WhatsApp deep link instead of duplicating this
 * logic (and getting it wrong) in each component.
 */
export function whatsappHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const intl = digits.startsWith('0') ? `2${digits}` : digits;
  return `https://wa.me/${intl}`;
}

/** "منذ 15 دقيقة" style relative time for notification cards. */
export function formatRelativeArabic(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  return formatArabicDate(iso);
}
