import type { ProductStats } from "../types";


type StatsCardsProps = {
  stats: ProductStats;
};


export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total produse</p>
        <p className="mt-2 text-3xl font-bold">{stats.total}</p>
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Cumpărate</p>
        <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-200">
          {stats.bought}
        </p>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Necumpărate</p>
        <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-200">
          {stats.pending}
        </p>
      </div>
    </section>
  );
}
