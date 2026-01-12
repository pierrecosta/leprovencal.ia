const isDev = process.env.NODE_ENV !== 'production';

export function logError(err) {
  if (!isDev) return;
  // Avoid dumping tokens/headers; keep it minimal.
  // eslint-disable-next-line no-console
  console.error(err);
}

export function logApiError(err) {
  if (!isDev) return;

  const status = err?.response?.status;
  const url = err?.config?.url;
  const method = err?.config?.method;
  const detail = err?.response?.data?.detail;

  const safe = {
    status,
    method,
    url,
    detail: typeof detail === 'string' ? detail : detail?.code || detail?.message || undefined,
  };

  // eslint-disable-next-line no-console
  console.warn('API error', safe);
}
