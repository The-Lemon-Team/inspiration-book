import { apiUrl } from './config';
import {
  authHeaders,
  clearToken,
  getRefreshToken,
  initTokenStorage,
  setTokens,
} from './token-storage';

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const currentRefresh = getRefreshToken();
  if (!currentRefresh) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      await setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function isAuthPath(path: string) {
  return path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/refresh') ||
    path.startsWith('/api/auth/logout');
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (response.status === 401 && !retried && !isAuthPath(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, init, true);
    }
    await clearToken();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(error.message)
        ? error.message.join(', ')
        : (error.message ?? 'Ошибка запроса'),
    );
  }

  return response.json() as Promise<T>;
}

export { request, initTokenStorage, refreshAccessToken };
export {
  getToken,
  getRefreshToken,
  setToken,
  setTokens,
  clearToken,
  authHeaders,
} from './token-storage';
