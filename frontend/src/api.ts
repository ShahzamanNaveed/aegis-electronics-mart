import { useQuery } from "@tanstack/react-query";
export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  article_count: number;
};
export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  topic: string;
  category_slug: string;
  category_name: string;
  reading_minutes: number;
  updated_at: string;
};
export type ArticlePage = {
  items: Article[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};
export type Detail = Article & {
  sections: {
    heading: string;
    paragraphs: string[];
    bullets: string[];
    note: string | null;
  }[];
  related: Article[];
};
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch("/api/v1" + path, { signal });
  if (!response.ok)
    throw new ApiError(
      response.status,
      response.status === 404
        ? "We couldn’t find that page."
        : "We couldn’t load the help content. Please try again.",
    );
  return response.json();
}
export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => get<Category[]>("/help/categories", signal),
  });
export const useArticles = (params: string) =>
  useQuery({
    queryKey: ["articles", params],
    queryFn: ({ signal }) =>
      get<ArticlePage>("/help/articles?" + params, signal),
  });
export const useArticle = (slug: string) =>
  useQuery({
    queryKey: ["article", slug],
    queryFn: ({ signal }) =>
      get<Detail>("/help/articles/" + encodeURIComponent(slug), signal),
    retry: false,
  });
