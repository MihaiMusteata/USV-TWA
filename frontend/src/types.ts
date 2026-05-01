export type UserAuth = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  email: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type Product = {
  id: number;
  name: string;
  quantity: number;
  category: string;
  bought: boolean;
  user_id: number;
};

export type ProductCreate = {
  name: string;
  quantity: number;
  category: string;
};

export type ProductUpdate = Partial<ProductCreate> & {
  bought?: boolean;
};

export type FilterType = "all" | "pending" | "bought";

export type AuthMode = "login" | "register";

export type Theme = "light" | "dark";

export type ProductModalMode = "create" | "edit";

export type SortType = "recent" | "name" | "quantity";

export type ProductStats = {
  total: number;
  bought: number;
  pending: number;
};
