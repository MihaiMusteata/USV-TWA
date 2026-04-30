import { Dispatch, FormEvent, SetStateAction } from "react";

import type { Product, ProductCreate } from "../types";
import { ProductCard } from "./ProductCard";


type ProductListProps = {
  actionId: number | null;
  editForm: ProductCreate;
  editingId: number | null;
  isLoading: boolean;
  onCancelEditing: () => void;
  onDelete: (productId: number) => void;
  onMarkAsBought: (productId: number) => void;
  onStartEditing: (product: Product) => void;
  onUpdate: (event: FormEvent<HTMLFormElement>, productId: number) => void;
  productError: string;
  products: Product[];
  setEditForm: Dispatch<SetStateAction<ProductCreate>>;
};


export function ProductList({
  actionId,
  editForm,
  editingId,
  isLoading,
  onCancelEditing,
  onDelete,
  onMarkAsBought,
  onStartEditing,
  onUpdate,
  productError,
  products,
  setEditForm,
}: ProductListProps) {
  return (
    <div className="mt-4 space-y-3">
      {productError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
          {productError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Se încarcă produsele...
        </p>
      ) : null}

      {!isLoading && products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Nu există produse pentru filtrul selectat.
        </p>
      ) : null}

      {products.map((product) => (
        <ProductCard
          actionId={actionId}
          editForm={editForm}
          isEditing={editingId === product.id}
          key={product.id}
          onCancelEditing={onCancelEditing}
          onDelete={onDelete}
          onMarkAsBought={onMarkAsBought}
          onStartEditing={onStartEditing}
          onUpdate={onUpdate}
          product={product}
          setEditForm={setEditForm}
        />
      ))}
    </div>
  );
}
