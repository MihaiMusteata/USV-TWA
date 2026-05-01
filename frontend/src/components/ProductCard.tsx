import { Icon } from "@iconify/react";

import type { Product } from "../types";
import {
  dangerButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../utils/styles";


type ProductCardProps = {
  actionId: number | null;
  onDelete: (productId: number) => void;
  onMarkAsBought: (productId: number) => void;
  onStartEditing: (product: Product) => void;
  product: Product;
};


export function ProductCard({
  actionId,
  onDelete,
  onMarkAsBought,
  onStartEditing,
  product,
}: ProductCardProps) {
  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
        product.bought
          ? "border-emerald-200 dark:border-emerald-900/70"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              product.bought
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <Icon
              icon={product.bought ? "mdi:cart-check" : "mdi:cart-outline"}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`break-words text-lg font-semibold ${
                  product.bought
                    ? "text-slate-500 line-through dark:text-slate-500"
                    : "text-slate-950 dark:text-white"
                }`}
              >
                {product.name}
              </h3>
              <span className="max-w-full truncate rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                <Icon
                  icon="mdi:shape-outline"
                  className="mr-1 inline h-3.5 w-3.5 align-[-2px]"
                  aria-hidden="true"
                />
                {product.category}
              </span>
              {product.bought ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                  <Icon
                    icon="mdi:check-circle-outline"
                    className="mr-1 inline h-3.5 w-3.5 align-[-2px]"
                    aria-hidden="true"
                  />
                  Cumpărat
                </span>
              ) : null}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Icon icon="mdi:counter" className="h-4 w-4" aria-hidden="true" />
              Cantitate: {product.quantity}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            className={`${secondaryButtonClass} gap-2`}
            onClick={() => onStartEditing(product)}
            disabled={actionId !== null}
          >
            <Icon icon="mdi:pencil-outline" className="h-4 w-4" aria-hidden="true" />
            Editează
          </button>
          <button
            type="button"
            className={`${primaryButtonClass} gap-2`}
            onClick={() => onMarkAsBought(product.id)}
            disabled={product.bought || actionId !== null}
          >
            <Icon icon="mdi:cart-check" className="h-4 w-4" aria-hidden="true" />
            Marchează cumpărat
          </button>
          <button
            type="button"
            className={`${dangerButtonClass} gap-2`}
            onClick={() => onDelete(product.id)}
            disabled={actionId !== null}
          >
            <Icon icon="mdi:trash-can-outline" className="h-4 w-4" aria-hidden="true" />
            Șterge
          </button>
        </div>
      </div>
    </article>
  );
}
