interface LoaderProps {
  message?: string;
}

export function Loader({ message = 'Chargement...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted">{message}</p>
    </div>
  );
}
