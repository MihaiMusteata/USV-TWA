import { Dispatch, FormEvent, SetStateAction } from "react";

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
      <h2 className="text-lg font-semibold">Adaugă produs</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="product-name" className="mb-1 block text-sm font-medium">
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
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
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
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
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

        <button type="submit" className={`${primaryButtonClass} w-full`}>
          Adaugă
        </button>
      </div>
    </form>
  );
}
