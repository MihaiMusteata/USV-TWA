import { Dispatch, FormEvent, SetStateAction, useEffect } from "react";
import { Icon } from "@iconify/react";

import type { ProductCreate, ProductModalMode } from "../types";
import { ProductForm } from "./ProductForm";


type ProductModalProps = {
  form: ProductCreate;
  isOpen: boolean;
  isSubmitting: boolean;
  mode: ProductModalMode;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setForm: Dispatch<SetStateAction<ProductCreate>>;
};


export function ProductModal({
  form,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  setForm,
}: ProductModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-300">
              {mode === "create" ? "Produs nou" : "Actualizare rapidă"}
            </p>
            <h2 id="product-modal-title" className="mt-1 text-xl font-bold">
              {mode === "create" ? "Adaugă în listă" : "Modifică produsul"}
            </h2>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            aria-label="Închide modalul"
            disabled={isSubmitting}
          >
            <Icon icon="mdi:close" className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">
          <ProductForm
            form={form}
            isSubmitting={isSubmitting}
            mode={mode}
            onCancel={onClose}
            onSubmit={onSubmit}
            setForm={setForm}
          />
        </div>
      </div>
    </div>
  );
}
