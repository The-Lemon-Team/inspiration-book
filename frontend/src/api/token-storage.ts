const ACCESS_KEY = 'inspiration_token';
const REFRESH_KEY = 'inspiration_refresh';

type TokenStorageAdapter = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
};

const localStorageAdapter: TokenStorageAdapter = {
  get(key) {
    return Promise.resolve(localStorage.getItem(key));
  },
  set(key, value) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  remove(key) {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return Promise.resolve();
  },
};

function usesElectronStorage(): boolean {
  return !!window.electronAPI?.tokenStorage;
}

function getAdapter(): TokenStorageAdapter {
  return window.electronAPI?.tokenStorage ?? localStorageAdapter;
}

function normalizeRefreshToken(value: string | null | undefined): string | null {
  if (!value || value === 'undefined' || value === 'null') return null;
  return value;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let initPromise: Promise<void> | null = null;

function syncLoadWebTokens() {
  if (usesElectronStorage()) return;
  accessToken = localStorage.getItem(ACCESS_KEY);
  refreshToken = normalizeRefreshToken(localStorage.getItem(REFRESH_KEY));
}

syncLoadWebTokens();

async function readStored(key: string): Promise<string | null> {
  return getAdapter().get(key);
}

async function writeStored(key: string, value: string) {
  await getAdapter().set(key, value);
}

async function removeStored(key: string) {
  await getAdapter().remove(key);
}

async function clearStored() {
  await getAdapter().clear();
}

async function migrateFromLocalStorage() {
  if (!usesElectronStorage()) return;

  const legacyAccess = localStorage.getItem(ACCESS_KEY);
  const legacyRefresh = localStorage.getItem(REFRESH_KEY);

  if (legacyAccess && !accessToken) {
    accessToken = legacyAccess;
    await writeStored(ACCESS_KEY, legacyAccess);
    localStorage.removeItem(ACCESS_KEY);
  }

  const normalizedLegacyRefresh = normalizeRefreshToken(legacyRefresh);
  if (normalizedLegacyRefresh && !refreshToken) {
    refreshToken = normalizedLegacyRefresh;
    await writeStored(REFRESH_KEY, normalizedLegacyRefresh);
    localStorage.removeItem(REFRESH_KEY);
  } else if (legacyRefresh) {
    localStorage.removeItem(REFRESH_KEY);
  }
}

export async function initTokenStorage() {
  if (!initPromise) {
    initPromise = (async () => {
      if (usesElectronStorage()) {
        accessToken = await readStored(ACCESS_KEY);
        refreshToken = normalizeRefreshToken(await readStored(REFRESH_KEY));
        await migrateFromLocalStorage();
      } else {
        syncLoadWebTokens();
      }
    })();
  }
  await initPromise;
}

export function getToken(): string | null {
  if (accessToken) return accessToken;
  if (!usesElectronStorage()) {
    return localStorage.getItem(ACCESS_KEY);
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (!usesElectronStorage()) {
    return normalizeRefreshToken(localStorage.getItem(REFRESH_KEY));
  }
  return null;
}

export async function setTokens(access: string, refresh?: string | null) {
  accessToken = access;
  refreshToken = normalizeRefreshToken(refresh);
  await writeStored(ACCESS_KEY, access);
  if (refreshToken) {
    await writeStored(REFRESH_KEY, refreshToken);
  } else {
    await removeStored(REFRESH_KEY);
  }
}

export async function setToken(token: string) {
  accessToken = token;
  await writeStored(ACCESS_KEY, token);
}

export async function clearToken() {
  accessToken = null;
  refreshToken = null;
  await clearStored();
  if (!usesElectronStorage()) {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export { ACCESS_KEY, REFRESH_KEY };
