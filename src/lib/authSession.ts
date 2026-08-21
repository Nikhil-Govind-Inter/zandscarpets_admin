// Tokens are httpOnly cookies (never readable by JS — see authApi.ts), so there's no
// way to ask "is there a session cookie?" directly. This flag instead just tracks
// "has this browser ever successfully established a session" so AuthContext can skip
// the /auth/me + /auth/refresh round trip on mount when there's clearly nothing to
// check (first-ever visit, or after an explicit logout).
const HAS_SESSION_KEY = "zands_admin_has_session";

export const hasStoredSession = (): boolean => {
  return localStorage.getItem(HAS_SESSION_KEY) === "true";
};

export const markStoredSession = (): void => {
  localStorage.setItem(HAS_SESSION_KEY, "true");
};

export const clearStoredSession = (): void => {
  localStorage.removeItem(HAS_SESSION_KEY);
};
