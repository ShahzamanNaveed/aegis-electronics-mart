import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Plus, Check, Scale } from "lucide-react";
import type { Product } from "./api";
import { money } from "./api";
import { useMart } from "./state";
import { ProductArt } from "./ProductArt";

export function CatalogSearch({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate();
  return (
    <form
      className="search catalog-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(
          new FormData(e.currentTarget).get("query") ?? "",
        ).trim();
        navigate(
          "/shop" + (value ? "?query=" + encodeURIComponent(value) : ""),
        );
      }}
    >
      <Search size={19} />
      <label className="sr-only" htmlFor="product-search">
        Search products
      </label>
      <input
        id="product-search"
        name="query"
        key={initial}
        defaultValue={initial}
        maxLength={120}
        placeholder="Search appliances, devices, specifications…"
      />
      <button type="submit" aria-label="Search products">
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
export function CatalogFailure({ retry }: { retry: () => void }) {
  return (
    <div className="status" role="alert">
      <h2>We couldn’t load the catalog.</h2>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
export function ProductActions({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const mart = useMart();
  const compared = mart.compare.includes(product.slug);
  return (
    <div className={"product-actions " + (compact ? "compact" : "")}>
      <button
        className="button"
        disabled={product.stock === 0}
        onClick={() => mart.add(product)}
        aria-label={"Add " + product.name + " to basket"}
      >
        <Plus size={16} />
        {product.stock === 0 ? "Out of stock" : "Add to basket"}
      </button>
      <button
        className="compare-button"
        aria-pressed={compared}
        onClick={() => mart.toggleCompare(product.slug)}
        aria-label={"Compare " + product.name}
      >
        {compared ? <Check size={17} /> : <Scale size={17} />}
        <span>{compared ? "Selected" : "Compare"}</span>
      </button>
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        className="product-image"
        to={"/products/" + product.slug}
        aria-label={"View " + product.name}
      >
        <span className={"stock-badge " + (!product.stock ? "out" : "")}>
          {product.stock ? "In stock" : "Out of stock"}
        </span>
        <ProductArt department={product.department} color={product.color} />
      </Link>
      <div className="product-card-body">
        <span className="product-brand">{product.brand}</span>
        <h3>
          <Link to={"/products/" + product.slug}>
            {product.name.replace(product.brand + " ", "")}
          </Link>
        </h3>
        <p>{product.summary}</p>
        <strong className="price">{money(product.price_paisa)}</strong>
        <ProductActions product={product} compact />
      </div>
    </article>
  );
}
export function ShopBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span>/</span>
      <Link to="/shop">Shop all</Link>
      <span>/</span>
      <span aria-current="page">{label}</span>
    </nav>
  );
}
