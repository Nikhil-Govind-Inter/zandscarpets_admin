import * as authApi from "@/services/auth/authApi";

// Drop-in replacement for `fetch()` used by feature-service files. Adds
// `credentials: "include"` (so the httpOnly auth cookies are sent) and, on a
// 401, transparently refreshes the access token once and retries the
// original request before giving up. Response parsing/error-throwing stays
// in each service file exactly as before — this only changes how the
// network call itself is made.

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler | null = null;

export const registerAuthFailureHandler = (handler: AuthFailureHandler | null): void => {
  onAuthFailure = handler;
};

let refreshInFlight: Promise<boolean> | null = null;

const attemptRefresh = async (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = authApi
      .refresh()
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const requestInit: RequestInit = { ...init, credentials: "include" };
  const response = await fetch(input, requestInit);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await attemptRefresh();
  if (!refreshed) {
    onAuthFailure?.();
    return response;
  }

  return fetch(input, requestInit);
};
