export function isValidUrl(url: string): boolean {
  if (!url) return true; // Empty is considered valid (optional field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
