import { Dispatch, FormEvent, SetStateAction } from "react";

import type { AuthMode, UserAuth } from "../types";
import { inputClass, primaryButtonClass } from "../utils/styles";


type AuthPanelProps = {
  authError: string;
  authForm: UserAuth;
  authMode: AuthMode;
  isSubmittingAuth: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setAuthForm: Dispatch<SetStateAction<UserAuth>>;
  setAuthMode: Dispatch<SetStateAction<AuthMode>>;
};


export function AuthPanel({
  authError,
  authForm,
  authMode,
  isSubmittingAuth,
  onSubmit,
  setAuthForm,
  setAuthMode,
}: AuthPanelProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-89px)] max-w-md items-center px-4 py-8 sm:px-6">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              authMode === "login"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            onClick={() => setAuthMode("login")}
          >
            Autentificare
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              authMode === "register"
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            onClick={() => setAuthMode("register")}
          >
            Înregistrare
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              className={inputClass}
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, email: event.target.value }))
              }
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Parolă
            </label>
            <input
              id="password"
              className={inputClass}
              type="password"
              minLength={8}
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({ ...current, password: event.target.value }))
              }
              autoComplete={authMode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>

          {authError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
              {authError}
            </p>
          ) : null}

          <button type="submit" className={`${primaryButtonClass} w-full`} disabled={isSubmittingAuth}>
            {isSubmittingAuth
              ? "Se procesează..."
              : authMode === "login"
                ? "Autentifică-te"
                : "Creează cont"}
          </button>
        </form>
      </section>
    </main>
  );
}
