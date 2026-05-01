import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthPanel } from "./components/AuthPanel";
import { ConfirmationDialog } from "./components/ConfirmationDialog";
import { FilterTabs } from "./components/FilterTabs";
import { Header } from "./components/Header";
import { ProductList } from "./components/ProductList";
import { ProductModal } from "./components/ProductModal";
import { ProductToolbar } from "./components/ProductToolbar";
import { StatsCards } from "./components/StatsCards";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useTheme } from "./hooks/useTheme";
import type { Product } from "./types";


type ConfirmationState = {
  confirmLabel: string;
  description: string;
  icon: string;
  onConfirm: () => Promise<void>;
  title: string;
};


function App() {
  const theme = useTheme();
  const auth = useAuth();
  const products = useProducts(auth.token, auth.expireSession, auth.refreshSession);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const handleLogout = () => {
    auth.logout();
    products.resetProducts();
    products.setProductError("");
    setConfirmation(null);
  };

  const requestDeleteProduct = (product: Product) => {
    setConfirmation({
      confirmLabel: "Șterge produsul",
      description: `Produsul "${product.name}" va fi șters definitiv din lista ta.`,
      icon: "mdi:trash-can-outline",
      onConfirm: async () => {
        await products.handleDeleteProduct(product.id);
        setConfirmation(null);
      },
      title: "Ștergi acest produs?",
    });
  };

  const requestClearBoughtProducts = () => {
    if (products.stats.bought === 0) {
      void products.handleClearBoughtProducts();
      return;
    }

    setConfirmation({
      confirmLabel: "Curăță lista",
      description: `${products.stats.bought} produse cumpărate vor fi șterse definitiv din lista ta.`,
      icon: "mdi:broom",
      onConfirm: async () => {
        await products.handleClearBoughtProducts();
        setConfirmation(null);
      },
      title: "Ștergi produsele cumpărate?",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header
        email={auth.email}
        isAuthenticated={Boolean(auth.token)}
        onLogout={handleLogout}
        onToggleTheme={theme.toggleTheme}
        theme={theme.theme}
      />

      {!auth.token ? (
        <AuthPanel
          authError={auth.authError}
          authForm={auth.authForm}
          authMode={auth.authMode}
          isSubmittingAuth={auth.isSubmittingAuth}
          onSubmit={auth.submitAuth}
          setAuthForm={auth.setAuthForm}
          setAuthMode={auth.setAuthMode}
        />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-300">
                  Dashboard cumpărături
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
                  Planifică lista, marchează progresul și ține coșul sub control.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Caută rapid produse, filtrează după categorie și gestionează lista printr-un
                  formular modal compact.
                </p>
              </div>
              <div className="border-t border-slate-200 bg-emerald-50 p-5 dark:border-slate-800 dark:bg-emerald-950/20 lg:border-l lg:border-t-0">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Progres cumpărături
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{
                      width: `${
                        products.stats.total > 0
                          ? Math.round((products.stats.bought / products.stats.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-200">
                  {products.stats.total > 0
                    ? `${products.stats.bought} din ${products.stats.total} produse cumpărate`
                    : "Adaugă primul produs ca să începi lista."}
                </p>
              </div>
            </div>
          </section>

          <StatsCards stats={products.stats} />

          <section className="mt-6 space-y-4">
            <ProductToolbar
              boughtCount={products.stats.bought}
              categories={products.categories}
              categoryFilter={products.categoryFilter}
              isBulkAction={products.actionId !== null}
              onClearBought={requestClearBoughtProducts}
              onOpenCreate={products.openCreateModal}
              searchTerm={products.searchTerm}
              setCategoryFilter={products.setCategoryFilter}
              setSearchTerm={products.setSearchTerm}
              setSortMode={products.setSortMode}
              shownCount={products.filteredProducts.length}
              sortMode={products.sortMode}
              totalCount={products.stats.total}
            />

            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <FilterTabs filter={products.filter} setFilter={products.setFilter} />
            </div>

            <ProductList
              actionId={products.actionId}
              isLoading={products.isLoadingProducts}
              onDelete={requestDeleteProduct}
              onMarkAsBought={products.handleMarkAsBought}
              onStartEditing={products.startEditing}
              productError={products.productError}
              products={products.filteredProducts}
            />
          </section>

          <ProductModal
            form={products.productModalMode === "create" ? products.productForm : products.editForm}
            isOpen={products.isProductModalOpen}
            isSubmitting={products.actionId !== null}
            mode={products.productModalMode}
            onClose={products.closeProductModal}
            onSubmit={(event) => {
              if (products.productModalMode === "create") {
                void products.handleCreateProduct(event);
                return;
              }
              if (products.editingId !== null) {
                void products.handleUpdateProduct(event, products.editingId);
              }
            }}
            setForm={
              products.productModalMode === "create"
                ? products.setProductForm
                : products.setEditForm
            }
          />
        </main>
      )}

      <ConfirmationDialog
        confirmLabel={confirmation?.confirmLabel ?? ""}
        description={confirmation?.description ?? ""}
        icon={confirmation?.icon}
        isOpen={confirmation !== null}
        isProcessing={products.actionId !== null}
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation) {
            void confirmation.onConfirm();
          }
        }}
        title={confirmation?.title ?? ""}
      />

      <ToastContainer
        autoClose={2600}
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        position="top-right"
        progressClassName="bg-emerald-500"
        theme={theme.theme}
      />
    </div>
  );
}

export default App;
