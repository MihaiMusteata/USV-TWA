import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthPanel } from "./components/AuthPanel";
import { FilterTabs } from "./components/FilterTabs";
import { Header } from "./components/Header";
import { ProductForm } from "./components/ProductForm";
import { ProductList } from "./components/ProductList";
import { StatsCards } from "./components/StatsCards";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useTheme } from "./hooks/useTheme";


function App() {
  const theme = useTheme();
  const auth = useAuth();
  const products = useProducts(auth.token, auth.expireSession);

  const handleLogout = () => {
    auth.logout();
    products.resetProducts();
    products.setProductError("");
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
          <StatsCards stats={products.stats} />

          <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
            <ProductForm
              form={products.productForm}
              onSubmit={products.handleCreateProduct}
              setForm={products.setProductForm}
            />

            <section className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Produse</h2>
                <FilterTabs filter={products.filter} setFilter={products.setFilter} />
              </div>

              <ProductList
                actionId={products.actionId}
                editForm={products.editForm}
                editingId={products.editingId}
                isLoading={products.isLoadingProducts}
                onCancelEditing={products.stopEditing}
                onDelete={products.handleDeleteProduct}
                onMarkAsBought={products.handleMarkAsBought}
                onStartEditing={products.startEditing}
                onUpdate={products.handleUpdateProduct}
                productError={products.productError}
                products={products.filteredProducts}
                setEditForm={products.setEditForm}
              />
            </section>
          </section>
        </main>
      )}

      <ToastContainer
        autoClose={2600}
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        position="top-right"
        progressClassName="bg-emerald-500"
        theme={theme.theme}
        toastClassName={() =>
          "rounded-lg border border-slate-200 bg-white text-slate-950 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        }
      />
    </div>
  );
}

export default App;
