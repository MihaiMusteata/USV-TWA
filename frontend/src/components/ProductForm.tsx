import { Dispatch, FormEvent, SetStateAction } from "react";
import { Icon } from "@iconify/react";

import type { ProductCreate } from "../types";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "../utils/styles";


type ProductFormProps = {
  form: ProductCreate;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setForm: Dispatch<SetStateAction<ProductCreate>>;
};


export function ProductForm({
  form,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  setForm,
}: ProductFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Icon
          icon={mode === "create" ? "mdi:plus-circle-outline" : "mdi:pencil-outline"}
          className="h-5 w-5 text-emerald-600"
          aria-hidden="true"
        />
        {mode === "create" ? "Adaugă produs" : "Editează produs"}
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="product-name" className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:tag-outline" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Nume
          </label>
          <input
            id="product-name"
            className={inputClass}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:counter" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Cantitate
          </label>
          <input
            id="quantity"
            className={inputClass}
            type="number"
            min={1}
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                quantity: Math.max(1, Number(event.target.value)),
              }))
            }
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 flex items-center gap-2 text-sm font-medium">
            <Icon icon="mdi:shape-outline" className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Categorie
          </label>
          <input
            id="category"
            className={inputClass}
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            required
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={`${secondaryButtonClass} gap-2`}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <Icon icon="mdi:close-circle-outline" className="h-4 w-4" aria-hidden="true" />
            Renunță
          </button>
          <button type="submit" className={`${primaryButtonClass} gap-2`} disabled={isSubmitting}>
            <Icon
              icon={mode === "create" ? "mdi:cart-plus" : "mdi:content-save-outline"}
              className="h-4 w-4"
              aria-hidden="true"
            />
            {isSubmitting ? "Se salvează..." : mode === "create" ? "Adaugă" : "Salvează"}
          </button>
        </div>
      </div>
    </form>
  );
}
