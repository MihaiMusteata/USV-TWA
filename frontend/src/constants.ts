import type { FilterType, ProductCreate } from "./types";

export const TOKEN_KEY = "shopping_token";
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
