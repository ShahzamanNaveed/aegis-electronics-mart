import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { BasketItem, Product } from "./api";

type Saved = { basket: BasketItem[]; compare: string[] };
const KEY = "aegis-mart-v1";
function read(): Saved {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    const valid = (s: unknown): s is string =>
      typeof s === "string" && /^[a-z0-9-]{1,120}$/.test(s);
    const basket: BasketItem[] = Array.isArray(data.basket)
      ? data.basket
          .filter(
            (i: BasketItem) =>
              i &&
              valid(i.slug) &&
              Number.isInteger(i.quantity) &&
              i.quantity >= 1 &&
              i.quantity <= 5,
          )
          .slice(0, 20)
      : [];
    return {
      basket: basket.filter(
        (i, n) => basket.findIndex((j) => j.slug === i.slug) === n,
      ),
      compare: Array.isArray(data.compare)
        ? Array.from(new Set<string>(data.compare.filter(valid))).slice(0, 3)
        : [],
    };
  } catch {
    return { basket: [], compare: [] };
  }
}
type Store = Saved & {
  notice: string;
  storageFailed: boolean;
  add: (product: Product) => void;
  quantity: (slug: string, value: number) => void;
  remove: (slug: string) => void;
  toggleCompare: (slug: string) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export function MartProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(read);
  const [notice, setNotice] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      setStorageFailed(true);
    }
  }, [saved]);
  function add(p: Product) {
    const previous = saved.basket.find((i) => i.slug === p.slug);
    if (p.stock === 0) {
      setNotice("This sample product is out of stock.");
      return;
    }
    if (previous && previous.quantity >= Math.min(5, p.stock)) {
      setNotice("The available quantity or five-item limit has been reached.");
      return;
    }
    if (!previous && saved.basket.length >= 20) {
      setNotice("Your basket can hold up to 20 different products.");
      return;
    }
    setSaved((s) => ({
      ...s,
      basket: previous
        ? s.basket.map((i) =>
            i.slug === p.slug ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...s.basket, { slug: p.slug, quantity: 1 }],
    }));
    setNotice(p.name + " added to your basket.");
  }
  function toggleCompare(slug: string) {
    if (!saved.compare.includes(slug) && saved.compare.length >= 3) {
      setNotice("Compare up to three products. Remove one to add another.");
      return;
    }
    setSaved((s) => ({
      ...s,
      compare: s.compare.includes(slug)
        ? s.compare.filter((x) => x !== slug)
        : [...s.compare, slug],
    }));
    setNotice(
      saved.compare.includes(slug)
        ? "Product removed from comparison."
        : "Product added to comparison.",
    );
  }
  return (
    <Context.Provider
      value={{
        ...saved,
        notice,
        storageFailed,
        add,
        toggleCompare,
        quantity: (slug, value) =>
          setSaved((s) => ({
            ...s,
            basket: s.basket.map((i) =>
              i.slug === slug
                ? { ...i, quantity: Math.min(5, Math.max(1, value)) }
                : i,
            ),
          })),
        remove: (slug) =>
          setSaved((s) => ({
            ...s,
            basket: s.basket.filter((i) => i.slug !== slug),
          })),
        clear: () => setSaved((s) => ({ ...s, basket: [] })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useMart() {
  const value = useContext(Context);
  if (!value) throw new Error("MartProvider is required");
  return value;
}
