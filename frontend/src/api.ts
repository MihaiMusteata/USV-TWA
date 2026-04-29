import type { Product, ProductCreate, ProductUpdate, TokenResponse, UserAuth } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type RequestOptions = RequestInit & {
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = "A aparut o eroare.";
    try {
      const data = (await response.json()) as { detail?: string | Array<{ msg: string }> };
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail[0].msg;
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function register(payload: UserAuth): Promise<TokenResponse> {
  return request<TokenResponse>("/inregistrare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: UserAuth): Promise<TokenResponse> {
  return request<TokenResponse>("/autentificare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProducts(token: string): Promise<Product[]> {
  return request<Product[]>("/produse", { token });
}

export function createProduct(payload: ProductCreate, token: string): Promise<Product> {
  return request<Product>("/produse", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  id: number,
  payload: ProductUpdate,
  token: string,
): Promise<Product> {
  return request<Product>(`/produse/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function markAsBought(id: number, token: string): Promise<Product> {
  return request<Product>(`/produse/${id}/cumpara`, {
    method: "PATCH",
    token,
  });
}

export function deleteProduct(id: number, token: string): Promise<void> {
  return request<void>(`/produse/${id}`, {
    method: "DELETE",
    token,
  });
}
