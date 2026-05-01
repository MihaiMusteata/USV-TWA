import { Icon } from "@iconify/react";

import type { Theme } from "../types";
import { dangerButtonClass, secondaryButtonClass } from "../utils/styles";


type HeaderProps = {
  email: string;
  isAuthenticated: boolean;
  onLogout: () => void;
  onToggleTheme: () => void;
  theme: Theme;
};


export function Header({
  email,
  isAuthenticated,
  onLogout,
  onToggleTheme,
  theme,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Icon icon="mdi:cart-outline" className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">
              Lista de cumpărături
            </h1>
            {email ? (
              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-400">
                Conectat ca {email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${secondaryButtonClass} gap-2`}
            onClick={onToggleTheme}
            aria-label="Schimbă tema"
          >
            <Icon
              icon={theme === "dark" ? "mdi:white-balance-sunny" : "mdi:weather-night"}
              className="h-4 w-4"
              aria-hidden="true"
            />
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {isAuthenticated ? (
            <button type="button" className={`${dangerButtonClass} gap-2`} onClick={onLogout}>
              <Icon icon="mdi:logout" className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
