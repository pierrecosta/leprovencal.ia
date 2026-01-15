interface ApiAlertProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
}

export function ApiAlert({ message, type = 'error', onDismiss }: ApiAlertProps) {
  const colorClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`border rounded-md p-4 ${colorClasses[type]} relative`} role="alert">
      <p>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-current hover:opacity-70"
          aria-label="Fermer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
