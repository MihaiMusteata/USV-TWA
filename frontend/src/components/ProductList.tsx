import { Icon } from "@iconify/react";

import type { Product } from "../types";
import { ProductCard } from "./ProductCard";


type ProductListProps = {
  actionId: number | null;
  isLoading: boolean;
  onDelete: (productId: number) => void;
  onMarkAsBought: (productId: number) => void;
  onStartEditing: (product: Product) => void;
  productError: string;
  products: Product[];
};


export function ProductList({
  actionId,
  isLoading,
  onDelete,
  onMarkAsBought,
  onStartEditing,
  productError,
  products,
}: ProductListProps) {
  return (
    <div className="mt-4 space-y-3">
      {productError ? (
        <p className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
          <Icon icon="mdi:alert-circle-outline" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {productError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" aria-hidden="true" />
          Se încarcă produsele...
        </p>
      ) : null}

      {!isLoading && products.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          <Icon icon="mdi:clipboard-text-search-outline" className="h-5 w-5 shrink-0" aria-hidden="true" />
          Nu există produse pentru filtrul selectat.
        </p>
      ) : null}

      {products.map((product) => (
        <ProductCard
          actionId={actionId}
          key={product.id}
          onDelete={onDelete}
          onMarkAsBought={onMarkAsBought}
          onStartEditing={onStartEditing}
          product={product}
        />
      ))}
    </div>
  );
}
