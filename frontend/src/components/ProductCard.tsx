import { Dispatch, FormEvent, SetStateAction } from "react";

import type { Product, ProductCreate } from "../types";
import {
  dangerButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../utils/styles";


type ProductCardProps = {
  actionId: number | null;
  editForm: ProductCreate;
  isEditing: boolean;
  onCancelEditing: () => void;
  onDelete: (productId: number) => void;
  onMarkAsBought: (productId: number) => void;
  onStartEditing: (product: Product) => void;
  onUpdate: (event: FormEvent<HTMLFormElement>, productId: number) => void;
  product: Product;
  setEditForm: Dispatch<SetStateAction<ProductCreate>>;
};


export function ProductCard({
  actionId,
  editForm,
  isEditing,
  onCancelEditing,
  onDelete,
  onMarkAsBought,
  onStartEditing,
  onUpdate,
  product,
  setEditForm,
}: ProductCardProps) {
  if (isEditing) {
    return (
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
        <form className="space-y-3" onSubmit={(event) => onUpdate(event, product.id)}>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_160px]">
            <input
              className={inputClass}
              value={editForm.name}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
            <input
              className={inputClass}
              type="number"
              min={1}
              value={editForm.quantity}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  quantity: Math.max(1, Number(event.target.value)),
                }))
              }
              required
            />
            <input
              className={inputClass}
              value={editForm.category}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, category: event.target.value }))
              }
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primaryButtonClass} disabled={actionId === product.id}>
              Salvează
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onCancelEditing}
              disabled={actionId === product.id}
            >
              Renunță
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              {product.category}
            </span>
            {product.bought ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                Cumpărat
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cantitate: {product.quantity}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => onStartEditing(product)}
            disabled={actionId === product.id}
          >
            Editează
          </button>
          <button
            type="button"
            className={primaryButtonClass}
            onClick={() => onMarkAsBought(product.id)}
            disabled={product.bought || actionId === product.id}
          >
            Marchează cumpărat
          </button>
          <button
            type="button"
            className={dangerButtonClass}
            onClick={() => onDelete(product.id)}
            disabled={actionId === product.id}
          >
            Șterge
          </button>
        </div>
      </div>
    </article>
  );
}
