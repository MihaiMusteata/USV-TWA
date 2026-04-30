import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  markAsBought,
  updateProduct,
} from "../api";
import { emptyProductForm } from "../constants";
import type { FilterType, Product, ProductCreate, ProductStats } from "../types";


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

  const resetProducts = useCallback(() => {
    setProducts([]);
    setEditingId(null);
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

  const filteredProducts = useMemo(() => {
    if (filter === "bought") {
      return products.filter((product) => product.bought);
    }
    if (filter === "pending") {
      return products.filter((product) => !product.bought);
    }
    return products;
  }, [filter, products]);

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setProductError("");
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
    } catch (error) {
      setProductError(error instanceof Error ? error.message : "Produsul nu a putut fi adăugat.");
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      quantity: product.quantity,
      category: product.category,
    });
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

  return {
    actionId,
    editForm,
    editingId,
    filter,
    filteredProducts,
    handleCreateProduct,
    handleDeleteProduct,
    handleMarkAsBought,
    handleUpdateProduct,
    isLoadingProducts,
    loadProducts,
    productError,
    productForm,
    resetProducts,
    setEditForm,
    setFilter,
    setProductError,
    setProductForm,
    startEditing,
    stats,
    stopEditing: () => setEditingId(null),
  };
}
