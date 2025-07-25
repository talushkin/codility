// --- Types ---
export interface Product {
  _id: string;
  title: string;
  description?: String|undefined;
  price?: number|string|undefined;
  imageUrl?: string;
  createdAt?: string;
  categoryId?: string;
  category?: string;
}

export interface Category {
  _id: string;
  category: string;
  translatedCategory?: { lang: string; value: string; _id: string }[];
  itemPage: Product[];
}

export type Categories = Category[];

export interface SiteData {
  header: { logo: string };
  categories: Categories,
  "success": string,
  "message": string
}