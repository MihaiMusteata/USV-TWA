import { FormEvent, useCallback, useState } from "react";

import { login, register } from "../api";
import { EMAIL_KEY, TOKEN_KEY } from "../constants";
import type { AuthMode, UserAuth } from "../types";


export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState<string>(() => localStorage.getItem(EMAIL_KEY) ?? "");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<UserAuth>({ email: "", password: "" });
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail("");
  }, []);

  const expireSession = useCallback(
    (message = "Sesiunea a expirat. Autentifică-te din nou.") => {
      clearSession();
      setAuthError(message);
    },
    [clearSession],
  );

  const saveSession = (nextToken: string, nextEmail: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(EMAIL_KEY, nextEmail);
    setToken(nextToken);
    setEmail(nextEmail);
  };

  const logout = () => {
    clearSession();
    setAuthError("");
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
      saveSession(response.access_token, response.email);
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Autentificarea a eșuat.");
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
    setAuthError,
    setAuthForm,
    setAuthMode,
    submitAuth,
    token,
  };
}
