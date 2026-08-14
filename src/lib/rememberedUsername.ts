// "Remember me" only ever persists the *username*, never the password.
// Password recall is left to the browser's own (OS-keychain-backed) password
// manager via autoComplete="current-password" on the login form.
const REMEMBERED_USERNAME_KEY = "zands_admin_remembered_username";

export const getRememberedUsername = (): string | null => {
  return localStorage.getItem(REMEMBERED_USERNAME_KEY);
};

export const setRememberedUsername = (username: string): void => {
  localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
};

export const clearRememberedUsername = (): void => {
  localStorage.removeItem(REMEMBERED_USERNAME_KEY);
};
