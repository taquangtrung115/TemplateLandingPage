let cachedToken = null;
let cachedUser = null;

const getLocalStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

const parseUser = (value) => {
  if (!value || value === 'undefined' || value === 'null') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const readAuthToken = () => {
  const storage = getLocalStorage();
  if (!storage) return cachedToken;
  try {
    const value = storage.getItem('token');
    cachedToken = value && value !== 'undefined' && value !== 'null' ? value : null;
  } catch {
    // Keep in-memory session
  }
  return cachedToken;
};

export const readAuthUser = () => {
  const storage = getLocalStorage();
  if (!storage) return cachedUser;
  try {
    cachedUser = parseUser(storage.getItem('user'));
  } catch {
    // Keep in-memory profile
  }
  return cachedUser;
};

export const rememberAuthToken = (token) => {
  cachedToken = token && token !== 'undefined' && token !== 'null' ? token : null;
};

export const rememberAuthUser = (user) => {
  cachedUser = user || null;
};

export const writeAuthSession = (token, user) => {
  rememberAuthToken(token);
  rememberAuthUser(user);
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    if (cachedToken) storage.setItem('token', cachedToken);
    else storage.removeItem('token');
    if (cachedUser) storage.setItem('user', JSON.stringify(cachedUser));
    else storage.removeItem('user');
    return true;
  } catch {
    return false;
  }
};

export const clearAuthSession = () => writeAuthSession(null, null);

export const applyAuthStorageEvent = (key, value) => {
  if (key === 'token') rememberAuthToken(value);
  if (key === 'user') rememberAuthUser(parseUser(value));
};
