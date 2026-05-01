import { Dispatch, FormEvent, SetStateAction } from "react";
import { Icon } from "@iconify/react";

import type { ProductCreate } from "../types";
import { inputClass, primaryButtonClass } from "../utils/styles";


type ProductFormProps = {
  form: ProductCreate;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setForm: Dispatch<SetStateAction<ProductCreate>>;
};


export function ProductForm({ form, onSubmit, setForm }: ProductFormProps) {
  return (
    <form
      className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onSubmit={onSubmit}
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Icon icon="mdi:plus-circle-outline" className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        Adaugă produs
      </h2>
      <div className="mt-4 space-y-4">
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

        <button type="submit" className={`${primaryButtonClass} w-full gap-2`}>
          <Icon icon="mdi:cart-plus" className="h-4 w-4" aria-hidden="true" />
          Adaugă
        </button>
      </div>
    </form>
  );
}
