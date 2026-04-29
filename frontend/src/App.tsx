import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  login,
  markAsBought,
  register,
  updateProduct,
} from "./api";
import type { FilterType, Product, ProductCreate, UserAuth } from "./types";

const TOKEN_KEY = "shopping_token";
const EMAIL_KEY = "shopping_email";
const THEME_KEY = "shopping_theme";

const emptyProductForm: ProductCreate = {
  nume: "",
  cantitate: 1,
  categorie: "General",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500";

const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800";

const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950";

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "toate", label: "Toate" },
  { value: "necumparate", label: "Necumpărate" },
  { value: "cumparate", label: "Cumpărate" },
];

function getInitialTheme(): "light" | "dark" {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState<string>(() => localStorage.getItem(EMAIL_KEY) ?? "");
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterType>("toate");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState<UserAuth>({ email: "", parola: "" });
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [productForm, setProductForm] = useState<ProductCreate>(emptyProductForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductCreate>(emptyProductForm);
  const [actionId, setActionId] = useState<number | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail("");
    setProducts([]);
    setEditingId(null);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCancelled = false;
    setIsLoadingProducts(true);
    setProductError("");

    getProducts(token)
      .then((items) => {
        if (!isCancelled) {
          setProducts(items);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          clearSession();
          setAuthError("Sesiunea a expirat. Autentifică-te din nou.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [clearSession, token]);

  const stats = useMemo(() => {
    const bought = products.filter((product) => product.cumparat).length;
    return {
      total: products.length,
      bought,
      pending: products.length - bought,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (filter === "cumparate") {
      return products.filter((product) => product.cumparat);
    }
    if (filter === "necumparate") {
      return products.filter((product) => !product.cumparat);
    }
    return products;
  }, [filter, products]);

  const saveSession = (nextToken: string, nextEmail: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(EMAIL_KEY, nextEmail);
    setToken(nextToken);
    setEmail(nextEmail);
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError("");

    try {
      const payload: UserAuth = {
        email: authForm.email.trim(),
        parola: authForm.parola,
      };
      const response = authMode === "login" ? await login(payload) : await register(payload);
      saveSession(response.access_token, response.email);
      setAuthForm({ email: "", parola: "" });
      setProducts(await getProducts(response.access_token));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Autentificarea a eșuat.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthError("");
    setProductError("");
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setProductError("");
    try {
      const created = await createProduct(
        {
          nume: productForm.nume.trim(),
          cantitate: productForm.cantitate,
          categorie: productForm.categorie.trim(),
        },
        token,
      );
      setProducts((current) => [created, ...current]);
      setProductForm(emptyProductForm);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Produsul nu a putut fi adăugat.");
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      nume: product.nume,
      cantitate: product.cantitate,
      categorie: product.categorie,
    });
  };

  const handleUpdateProduct = async (event: FormEvent<HTMLFormElement>, productId: number) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setActionId(productId);
    setProductError("");
    try {
      const updated = await updateProduct(
        productId,
        {
          nume: editForm.nume.trim(),
          cantitate: editForm.cantitate,
          categorie: editForm.categorie.trim(),
        },
        token,
      );
      setProducts((current) =>
        current.map((product) => (product.id === productId ? updated : product)),
      );
      setEditingId(null);
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Produsul nu a putut fi editat.");
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAsBought = async (productId: number) => {
    if (!token) {
      return;
    }

    setActionId(productId);
    setProductError("");
    try {
      const updated = await markAsBought(productId, token);
      setProducts((current) =>
        current.map((product) => (product.id === productId ? updated : product)),
      );
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Produsul nu a putut fi marcat.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!token || !window.confirm("Ștergi acest produs?")) {
      return;
    }

    setActionId(productId);
    setProductError("");
    try {
      await deleteProduct(productId, token);
      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Produsul nu a putut fi șters.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-white">
              Lista de cumpărături
            </h1>
            {email ? (
              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-400">
                Conectat ca {email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              aria-label="Schimbă tema"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {token ? (
              <button type="button" className={dangerButtonClass} onClick={handleLogout}>
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {!token ? (
        <main className="mx-auto flex min-h-[calc(100vh-89px)] max-w-md items-center px-4 py-8 sm:px-6">
          <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 grid grid-cols-2 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
              <button
                type="button"
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                onClick={() => setAuthMode("login")}
              >
                Autentificare
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  authMode === "register"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                onClick={() => setAuthMode("register")}
              >
                Înregistrare
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  className={inputClass}
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, email: event.target.value }))
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">
                  Parolă
                </label>
                <input
                  id="password"
                  className={inputClass}
                  type="password"
                  minLength={8}
                  value={authForm.parola}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, parola: event.target.value }))
                  }
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {authError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
                  {authError}
                </p>
              ) : null}

              <button type="submit" className={`${primaryButtonClass} w-full`} disabled={isSubmittingAuth}>
                {isSubmittingAuth
                  ? "Se procesează..."
                  : authMode === "login"
                    ? "Autentifică-te"
                    : "Creează cont"}
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total produse</p>
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Cumpărate</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-200">
                {stats.bought}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/70 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Necumpărate</p>
              <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-200">
                {stats.pending}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <form
              className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              onSubmit={handleCreateProduct}
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
                    value={productForm.nume}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, nume: event.target.value }))
                    }
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
                    value={productForm.cantitate}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        cantitate: Math.max(1, Number(event.target.value)),
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
                    value={productForm.categorie}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, categorie: event.target.value }))
                    }
                    required
                  />
                </div>

                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  Adaugă
                </button>
              </div>
            </form>

            <section className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Produse</h2>
                <div className="grid grid-cols-3 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                        filter === option.value
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {productError ? (
                <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
                  {productError}
                </p>
              ) : null}

              <div className="mt-4 space-y-3">
                {isLoadingProducts ? (
                  <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Se încarcă produsele...
                  </p>
                ) : null}

                {!isLoadingProducts && filteredProducts.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    Nu există produse pentru filtrul selectat.
                  </p>
                ) : null}

                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
                  >
                    {editingId === product.id ? (
                      <form className="space-y-3" onSubmit={(event) => handleUpdateProduct(event, product.id)}>
                        <div className="grid gap-3 sm:grid-cols-[1fr_120px_160px]">
                          <input
                            className={inputClass}
                            value={editForm.nume}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, nume: event.target.value }))
                            }
                            required
                          />
                          <input
                            className={inputClass}
                            type="number"
                            min={1}
                            value={editForm.cantitate}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                cantitate: Math.max(1, Number(event.target.value)),
                              }))
                            }
                            required
                          />
                          <input
                            className={inputClass}
                            value={editForm.categorie}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, categorie: event.target.value }))
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
                            onClick={() => setEditingId(null)}
                            disabled={actionId === product.id}
                          >
                            Renunță
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`break-words text-lg font-semibold ${
                                product.cumparat
                                  ? "text-slate-500 line-through dark:text-slate-500"
                                  : "text-slate-950 dark:text-white"
                              }`}
                            >
                              {product.nume}
                            </h3>
                            <span className="max-w-full truncate rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                              {product.categorie}
                            </span>
                            {product.cumparat ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">
                                Cumpărat
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Cantitate: {product.cantitate}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={secondaryButtonClass}
                            onClick={() => startEditing(product)}
                            disabled={actionId === product.id}
                          >
                            Editează
                          </button>
                          <button
                            type="button"
                            className={primaryButtonClass}
                            onClick={() => handleMarkAsBought(product.id)}
                            disabled={product.cumparat || actionId === product.id}
                          >
                            Marchează cumpărat
                          </button>
                          <button
                            type="button"
                            className={dangerButtonClass}
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionId === product.id}
                          >
                            Șterge
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
