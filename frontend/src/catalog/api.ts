import { useQuery } from "@tanstack/react-query";
import { ApiError, get } from "../api";
export type Department = {
  slug: string;
  name: string;
  description: string;
  product_count: number;
};
export type Product = {
  id: string;
  slug: string;
  sku: string;
  department: string;
  name: string;
  brand: string;
  summary: string;
  price_paisa: number;
  stock: number;
  color: string;
  features: string[];
};
export type ProductDetail = Product & {
  description: string;
  specifications: Record<string, string>;
  in_box: string[];
  compatibility: string;
  care: string[];
  faqs: { question: string; answer: string }[];
  warranty: string;
  delivery: string;
  returns: string;
  help_slugs: string[];
  updated_at: string;
};
export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
};
export type BasketItem = { slug: string; quantity: number };
export type Quote = {
  lines: {
    product: Product;
    quantity: number;
    line_total_paisa: number;
    available: boolean;
  }[];
  subtotal_paisa: number;
  purchasable: boolean;
  simulation: boolean;
};
export const money = (paisa: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(paisa / 100);
export const useDepartments = () =>
  useQuery({
    queryKey: ["departments"],
    queryFn: ({ signal }) => get<Department[]>("/catalog/departments", signal),
  });
export const useBrands = () =>
  useQuery({
    queryKey: ["brands"],
    queryFn: ({ signal }) => get<string[]>("/catalog/brands", signal),
  });
export const useProducts = (params: string) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: ({ signal }) =>
      get<ProductPage>("/catalog/products?" + params, signal),
  });
export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) =>
      get<ProductDetail>(
        "/catalog/products/" + encodeURIComponent(slug),
        signal,
      ),
    retry: false,
  });
export const useSelection = (slugs: string[]) =>
  useQuery({
    queryKey: ["selection", slugs],
    queryFn: ({ signal }) =>
      get<ProductDetail[]>(
        "/catalog/selection?" +
          slugs.map((s) => "slug=" + encodeURIComponent(s)).join("&"),
        signal,
      ),
    enabled: slugs.length > 0,
    retry: false,
  });
export const useQuote = (items: BasketItem[]) =>
  useQuery({
    queryKey: ["quote", items],
    queryFn: async ({ signal }): Promise<Quote> => {
      const response = await fetch("/api/v1/catalog/basket/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        signal,
      });
      if (!response.ok)
        throw new ApiError(response.status, "Unable to price this basket.");
      return response.json();
    },
    enabled: items.length > 0,
    staleTime: 0,
    retry: false,
  });
