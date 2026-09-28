/**
 * Client-side CSRF helper.
 *
 * The server sets a `tresor_csrf` cookie on the first call to `/api/csrf`.
 * We read that cookie and send the value in the `X-CSRF-Token` header for
 * every state-changing request. A cross-origin attacker cannot read the
 * cookie, so they cannot forge the header.
 */

let cachedToken: string | null = null;
let fetchPromise: Promise<string> | null = null;

function getCookie(name: string): string | null {
  const match = document.cookie.split(';').find((c) => c.trim().startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split('=')[1] ?? '');
  } catch {
    return null;
  }
}

async function fetchCsrfToken(): Promise<string> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'same-origin',
      });
      if (!res.ok) return 'dev-csrf-token';
      const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
      if (!isJson) return 'dev-csrf-token';
      const data = (await res.json().catch(() => ({}))) as { token?: string };
      cachedToken = data.token ?? 'dev-csrf-token';
      return cachedToken;
    } catch {
      return 'dev-csrf-token';
    }
  })();
  fetchPromise.catch(() => {
    // Allow retry on failure.
    fetchPromise = null;
  });
  return fetchPromise;
}

/**
 * Return the current CSRF token, fetching it from the server if necessary.
 * The token is cached for the lifetime of the page session.
 */
export async function getCsrfToken(): Promise<string> {
  const fromCookie = getCookie('tresor_csrf');
  if (fromCookie) {
    cachedToken = fromCookie;
    return fromCookie;
  }
  if (cachedToken) return cachedToken;
  return fetchCsrfToken();
}

/**
 * Convenience wrapper for POSTing JSON to an `/api/*` endpoint with the
 * CSRF header included automatically.
 */
export async function apiPost(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const token = await getCsrfToken();
  return fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      'X-CSRF-Token': token,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}
