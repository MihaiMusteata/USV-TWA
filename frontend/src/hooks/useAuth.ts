import { FormEvent, useCallback, useState } from "react";
import { toast } from "react-toastify";

import { login, refreshToken as refreshAuthToken, register } from "../api";
import { EMAIL_KEY, REFRESH_TOKEN_KEY, TOKEN_KEY } from "../constants";
import type { AuthMode, UserAuth } from "../types";


export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
  const [email, setEmail] = useState<string>(() => localStorage.getItem(EMAIL_KEY) ?? "");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<UserAuth>({ email: "", password: "" });
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setRefreshToken(null);
    setEmail("");
  }, []);

  const expireSession = useCallback(
    (message = "Sesiunea a expirat. Autentifică-te din nou.") => {
      clearSession();
      setAuthError(message);
      toast.warning(message);
    },
    [clearSession],
  );

  const saveSession = useCallback(
    (nextToken: string, nextRefreshToken: string, nextEmail: string) => {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
      localStorage.setItem(EMAIL_KEY, nextEmail);
      setToken(nextToken);
      setRefreshToken(nextRefreshToken);
      setEmail(nextEmail);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const storedRefreshToken = refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      return null;
    }

    try {
      const response = await refreshAuthToken({ refresh_token: storedRefreshToken });
      saveSession(response.access_token, response.refresh_token, response.email);
      return response.access_token;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, refreshToken, saveSession]);

  const logout = () => {
    clearSession();
    setAuthError("");
    toast.info("Te-ai delogat.");
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const payload: UserAuth = {
        email: authForm.email.trim(),
        password: authForm.password,
      };
      const response = authMode === "login" ? await login(payload) : await register(payload);
      saveSession(response.access_token, response.refresh_token, response.email);
      setAuthForm({ email: "", password: "" });
      toast.success(authMode === "login" ? "Autentificare reușită." : "Cont creat cu succes.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Autentificarea a eșuat.";
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  return {
    authError,
    authForm,
    authMode,
    clearSession,
    email,
    expireSession,
    isSubmittingAuth,
    logout,
    refreshSession,
    setAuthError,
    setAuthForm,
    setAuthMode,
    submitAuth,
    token,
  };
}
