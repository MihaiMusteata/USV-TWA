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
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">
            Lista de cumpărături
          </h1>
          {email ? (
            <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-400">
              Conectat ca {email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={onToggleTheme}
            aria-label="Schimbă tema"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {isAuthenticated ? (
            <button type="button" className={dangerButtonClass} onClick={onLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
