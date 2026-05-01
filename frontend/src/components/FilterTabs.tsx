import { Dispatch, SetStateAction } from "react";
import { Icon } from "@iconify/react";

import { filterOptions } from "../constants";
import type { FilterType } from "../types";


type FilterTabsProps = {
  filter: FilterType;
  setFilter: Dispatch<SetStateAction<FilterType>>;
};


export function FilterTabs({ filter, setFilter }: FilterTabsProps) {
  return (
    <div className="grid grid-cols-3 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
            filter === option.value
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          onClick={() => setFilter(option.value)}
        >
          <Icon icon={option.icon} className="h-4 w-4" aria-hidden="true" />
          {option.label}
        </button>
      ))}
    </div>
  );
}
