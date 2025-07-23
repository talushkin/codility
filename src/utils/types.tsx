// --- Types ---
export interface Recipe {
  _id: string;
  title: string;
  ingredients?: string;
  description?: String|undefined;
  price?: number|undefined;
  preparation?: string;
  imageUrl?: string;
  createdAt?: string;
  categoryId?: string;
  category?: string;
}

export interface Category {
  _id: string;
  category: string;
  translatedCategory?: { lang: string; value: string; _id: string }[];
  itemPage: Recipe[];
}

export type Categories = Category[];

export interface SiteData {
  header: { logo: string };
  categories: Categories,
  "success": string,
  "message": string
}