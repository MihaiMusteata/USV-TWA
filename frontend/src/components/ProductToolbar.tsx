import { Dispatch, SetStateAction } from "react";
import { Icon } from "@iconify/react";

import { sortOptions } from "../constants";
import type { SortType } from "../types";
import {
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../utils/styles";


type ProductToolbarProps = {
  boughtCount: number;
  categories: string[];
  categoryFilter: string;
  isBulkAction: boolean;
  onClearBought: () => void;
  onOpenCreate: () => void;
  searchTerm: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSortMode: Dispatch<SetStateAction<SortType>>;
  shownCount: number;
  sortMode: SortType;
  totalCount: number;
};


export function ProductToolbar({
  boughtCount,
  categories,
  categoryFilter,
  isBulkAction,
  onClearBought,
  onOpenCreate,
  searchTerm,
  setCategoryFilter,
  setSearchTerm,
  setSortMode,
  shownCount,
  sortMode,
  totalCount,
}: ProductToolbarProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-300">
            Control listă
          </p>
          <h2 className="mt-1 text-xl font-bold">Produse</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Afișate {shownCount} din {totalCount} produse.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" className={`${primaryButtonClass} gap-2`} onClick={onOpenCreate}>
            <Icon icon="mdi:plus" className="h-4 w-4" aria-hidden="true" />
            Produs nou
          </button>
          <button
            type="button"
            className={`${dangerButtonClass} gap-2`}
            onClick={onClearBought}
            disabled={boughtCount === 0 || isBulkAction}
          >
            <Icon icon="mdi:broom" className="h-4 w-4" aria-hidden="true" />
            Curăță cumpărate
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_180px]">
        <label className="relative block">
          <span className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:magnify" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Caută
          </span>
          <input
            className={`${inputClass} pl-9`}
            placeholder="Nume sau categorie"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Icon
            icon="mdi:magnify"
            className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
        </label>

        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:shape-outline" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Categorie
          </span>
          <select
            className={inputClass}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Toate categoriile</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:sort" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Sortare
          </span>
          <select
            className={inputClass}
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortType)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(searchTerm || categoryFilter !== "all") ? (
        <button
          type="button"
          className={`${secondaryButtonClass} mt-3 gap-2`}
          onClick={() => {
            setSearchTerm("");
            setCategoryFilter("all");
          }}
        >
          <Icon icon="mdi:filter-remove-outline" className="h-4 w-4" aria-hidden="true" />
          Resetează filtrele
        </button>
      ) : null}
    </section>
  );
}
