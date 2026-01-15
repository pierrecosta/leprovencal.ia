export default function ApiAlert({ message, kind = 'error', className = '' }) {
  if (!message) return null;

  const base = 'rounded border px-3 py-2 text-sm';
  const styles =
    kind === 'warning'
      ? 'border-yellow-300 bg-yellow-50 text-yellow-900'
      : kind === 'info'
        ? 'border-blue-300 bg-blue-50 text-blue-900'
        : 'border-red-300 bg-red-50 text-red-900';

  return <div className={`${base} ${styles} ${className}`}>{String(message)}</div>;
}
