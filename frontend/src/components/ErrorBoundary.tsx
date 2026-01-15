import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React errors
 * Wraps the app to prevent full crashes and show user-friendly error messages
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error && errorInfo) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.resetError);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Une erreur s'est produite
                </h1>
                <p className="text-slate-600 mb-4">
                  L'application a rencontré une erreur inattendue. Nos excuses pour la gêne occasionnée.
                </p>
              </div>
            </div>

            {import.meta.env.DEV && (
              <details className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <summary className="cursor-pointer font-semibold text-slate-700 mb-2">
                  Détails de l'erreur (dev only)
                </summary>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Message:</p>
                    <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto">
                      {error.toString()}
                    </pre>
                  </div>
                  {errorInfo.componentStack && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Component Stack:</p>
                      <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-48 overflow-y-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Stack Trace:</p>
                      <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto max-h-48 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.resetError}
                className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Default fallback component for ErrorBoundary
 * Can be imported and customized for specific use cases
 */
export function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
      <div className="card max-w-lg w-full text-center">
        <h2 className="text-xl font-bold text-[var(--color-lavender)] mb-4">
          Oups ! Quelque chose s'est mal passé
        </h2>
        <p className="text-[var(--text-muted)] mb-6">
          {error.message || 'Une erreur inattendue est survenue.'}
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={resetError} className="btn btn-primary">
            Réessayer
          </button>
          <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
