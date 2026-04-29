export type UserAuth = {
  email: string;
  parola: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  email: string;
};

export type Product = {
  id: number;
  nume: string;
  cantitate: number;
  categorie: string;
  cumparat: boolean;
  utilizator_id: number;
};

export type ProductCreate = {
  nume: string;
  cantitate: number;
  categorie: string;
};

export type ProductUpdate = Partial<ProductCreate> & {
  cumparat?: boolean;
};

export type FilterType = "toate" | "necumparate" | "cumparate";
