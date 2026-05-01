import type { FilterType, ProductCreate, SortType } from "./types";

export const TOKEN_KEY = "shopping_token";
export const REFRESH_TOKEN_KEY = "shopping_refresh_token";
export const EMAIL_KEY = "shopping_email";
export const THEME_KEY = "shopping_theme";

export const emptyProductForm: ProductCreate = {
  name: "",
  quantity: 1,
  category: "General",
};

export const filterOptions: { value: FilterType; label: string; icon: string }[] = [
  { value: "all", label: "Toate", icon: "mdi:format-list-bulleted" },
  { value: "pending", label: "Necumpărate", icon: "mdi:clock-outline" },
  { value: "bought", label: "Cumpărate", icon: "mdi:check-circle-outline" },
];

export const sortOptions: { value: SortType; label: string }[] = [
  { value: "recent", label: "Cele mai noi" },
  { value: "name", label: "Nume A-Z" },
  { value: "quantity", label: "Cantitate" },
];
