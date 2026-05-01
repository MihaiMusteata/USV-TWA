import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  createProduct,
  deleteProduct,
  getProducts,
  markAsBought,
  updateProduct,
} from "../api";
import { emptyProductForm } from "../constants";
import type {
  FilterType,
  Product,
  ProductCreate,
  ProductModalMode,
  ProductStats,
  SortType,
} from "../types";


type UnauthorizedHandler = () => void;


export function useProducts(token: string | null, onUnauthorized: UnauthorizedHandler) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [productForm, setProductForm] = useState<ProductCreate>(emptyProductForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductCreate>(emptyProductForm);
  const [actionId, setActionId] = useState<number | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<ProductModalMode>("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortType>("recent");

  const resetProducts = useCallback(() => {
    setProducts([]);
    setEditingId(null);
    setIsProductModalOpen(false);
  }, []);

  const loadProducts = useCallback(
    async (activeToken = token) => {
      if (!activeToken) {
        return;
      }

      setIsLoadingProducts(true);
      setProductError("");

      try {
        setProducts(await getProducts(activeToken));
      } catch {
        resetProducts();
        onUnauthorized();
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [onUnauthorized, resetProducts, token],
  );

  useEffect(() => {
    if (!token) {
      resetProducts();
      return;
    }

    void loadProducts(token);
  }, [loadProducts, resetProducts, token]);

  const stats: ProductStats = useMemo(() => {
    const bought = products.filter((product) => product.bought).length;
    return {
      total: products.length,
      bought,
      pending: products.length - bought,
    };
  }, [products]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort((a, b) =>
      a.localeCompare(b, "ro"),
    ),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const visibleProducts = products.filter((product) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "bought" && product.bought) ||
        (filter === "pending" && !product.bought);
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesCategory && matchesSearch;
    });

    if (sortMode === "name") {
      return [...visibleProducts].sort((a, b) => a.name.localeCompare(b.name, "ro"));
    }
    if (sortMode === "quantity") {
      return [...visibleProducts].sort((a, b) => b.quantity - a.quantity);
    }
    return visibleProducts;
  }, [categoryFilter, filter, products, searchTerm, sortMode]);

  const openCreateModal = () => {
    setProductModalMode("create");
    setProductForm(emptyProductForm);
    setEditingId(null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingId(null);
    setEditForm(emptyProductForm);
    setProductError("");
  };

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setProductError("");
    setActionId(-2);
    try {
      const created = await createProduct(
        {
          name: productForm.name.trim(),
          quantity: productForm.quantity,
          category: productForm.category.trim(),
        },
        token,
      );
      setProducts((current) => [created, ...current]);
      setProductForm(emptyProductForm);
      setIsProductModalOpen(false);
      toast.success("Produs adăugat în listă.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Produsul nu a putut fi adăugat.";
      setProductError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const startEditing = (product: Product) => {
    setProductModalMode("edit");
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      quantity: product.quantity,
      category: product.category,
    });
    setProductError("");
    setIsProductModalOpen(true);
  };

  const handleUpdateProduct = async (
    event: FormEvent<HTMLFormElement>,
    productId: number,
  ) => {
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
          name: editForm.name.trim(),
          quantity: editForm.quantity,
          category: editForm.category.trim(),
        },
        token,
      );
      setProducts((current) =>
        current.map((product) => (product.id === productId ? updated : product)),
      );
      closeProductModal();
      toast.success("Produs actualizat.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Produsul nu a putut fi editat.";
      setProductError(message);
      toast.error(message);
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
      toast.success("Produs marcat ca fiind cumpărat.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Produsul nu a putut fi marcat.";
      setProductError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!token) {
      return;
    }

    setActionId(productId);
    setProductError("");
    try {
      await deleteProduct(productId, token);
      setProducts((current) => current.filter((product) => product.id !== productId));
      toast.success("Produs șters.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Produsul nu a putut fi șters.";
      setProductError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleClearBoughtProducts = async () => {
    if (!token) {
      return;
    }

    const boughtProducts = products.filter((product) => product.bought);
    if (boughtProducts.length === 0) {
      toast.info("Nu există produse cumpărate de șters.");
      return;
    }

    setActionId(-1);
    setProductError("");
    try {
      await Promise.all(boughtProducts.map((product) => deleteProduct(product.id, token)));
      setProducts((current) => current.filter((product) => !product.bought));
      toast.success("Produsele cumpărate au fost șterse.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Produsele cumpărate nu au putut fi șterse.";
      setProductError(message);
      toast.error(message);
      void loadProducts(token);
    } finally {
      setActionId(null);
    }
  };

  return {
    actionId,
    categories,
    categoryFilter,
    closeProductModal,
    editForm,
    editingId,
    filter,
    filteredProducts,
    handleClearBoughtProducts,
    handleCreateProduct,
    handleDeleteProduct,
    handleMarkAsBought,
    handleUpdateProduct,
    isProductModalOpen,
    isLoadingProducts,
    loadProducts,
    openCreateModal,
    productError,
    productForm,
    productModalMode,
    resetProducts,
    searchTerm,
    setCategoryFilter,
    setEditForm,
    setFilter,
    setProductError,
    setProductForm,
    setSearchTerm,
    setSortMode,
    sortMode,
    startEditing,
    stats,
    stopEditing: closeProductModal,
  };
}
