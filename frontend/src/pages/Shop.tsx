import { Link, useSearchParams } from "react-router-dom";
import { Title, Loading } from "../components/common";
import { useBrands, useDepartments, useProducts } from "../catalog/api";
import {
  CatalogFailure,
  ProductCard,
  ShopBreadcrumb,
} from "../catalog/components";

export function Shop() {
  const [search, setSearch] = useSearchParams();
  const departments = useDepartments();
  const brands = useBrands();
  const params = new URLSearchParams(search);
  params.set("page_size", "12");
  const products = useProducts(params.toString());
  const department = departments.data?.find(
    (d) => d.slug === search.get("department"),
  );
  const title = search.get("query")
    ? "Results for “" + search.get("query") + "”"
    : (department?.name ?? "All the everyday essentials.");
  function update(key: string, value: string) {
    const next = new URLSearchParams(search);
    if (key !== "page") next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setSearch(next);
  }
  return (
    <>
      <Title title={department?.name ?? "Shop the collection"} />
      <div className="container">
        <ShopBreadcrumb label={department?.name ?? "The collection"} />
        <div className="shop-heading">
          <div>
            <span className="eyebrow">THE AEGIS COLLECTION</span>
            <h1>{title}</h1>
            <p>
              {department?.description ??
                "Explore appliances, electronics, and essentials. Find the details that matter to you."}
            </p>
          </div>
          <span className="sample-pill">
            Illustrative products · Sample PKR prices
          </span>
        </div>
      </div>
      <section className="container shop-layout">
        <aside className="shop-filters">
          <h2>Find your fit</h2>
          <label htmlFor="department-filter">Department</label>
          <select
            id="department-filter"
            value={search.get("department") ?? ""}
            onChange={(e) => update("department", e.target.value)}
          >
            <option value="">All departments</option>
            {departments.data?.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.product_count})
              </option>
            ))}
          </select>
          <label htmlFor="brand-filter">Collection brand</label>
          <select
            id="brand-filter"
            value={search.get("brand") ?? ""}
            onChange={(e) => update("brand", e.target.value)}
          >
            <option value="">All brands</option>
            {brands.data?.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const next = new URLSearchParams(search);
              next.delete("page");
              for (const key of ["min_price", "max_price"]) {
                const value = String(data.get(key) ?? "");
                if (value)
                  next.set(key, String(Math.round(Number(value) * 100)));
                else next.delete(key);
              }
              setSearch(next);
            }}
          >
            <span className="filter-label">Price range (PKR)</span>
            <div className="price-range">
              <div>
                <label htmlFor="min-price">From</label>
                <input
                  id="min-price"
                  name="min_price"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  key={"min" + search.get("min_price")}
                  defaultValue={
                    search.has("min_price")
                      ? Number(search.get("min_price")) / 100
                      : ""
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="max-price">To</label>
                <input
                  id="max-price"
                  name="max_price"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  key={"max" + search.get("max_price")}
                  defaultValue={
                    search.has("max_price")
                      ? Number(search.get("max_price")) / 100
                      : ""
                  }
                  placeholder="Any"
                />
              </div>
            </div>
            <button className="outline-button" type="submit">
              Apply price range
            </button>
          </form>
          <label className="check-filter">
            <input
              type="checkbox"
              checked={search.get("in_stock") === "true"}
              onChange={(e) =>
                update("in_stock", e.target.checked ? "true" : "")
              }
            />
            In stock only
          </label>
          <Link className="text-link" to="/shop">
            Reset all filters
          </Link>
          <div className="filter-note">
            <p>Compare the details.</p>
            <span>
              Select Compare on up to three products, then open the comparison
              page.
            </span>
            <Link className="text-link" to="/compare">
              View comparison →
            </Link>
          </div>
        </aside>
        <div className="shop-results">
          <div className="shop-toolbar">
            <span aria-live="polite">
              {products.data
                ? `${products.data.total} products`
                : "Loading products…"}
            </span>
            <label htmlFor="sort-products">Sort by</label>
            <select
              id="sort-products"
              value={search.get("sort") ?? "featured"}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          {products.isPending ? (
            <Loading />
          ) : products.isError ? (
            <div>
              <CatalogFailure retry={() => products.refetch()} />
              <Link className="text-link" to="/shop">
                Reset search and filters
              </Link>
            </div>
          ) : products.data.items.length === 0 ? (
            <div className="status">
              <h2>No products match just yet.</h2>
              <p>Try another term, price range, or department.</p>
              <Link className="button" to="/shop">
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              <div className="products-grid shop-grid">
                {products.data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {products.data.pages > 1 && (
                <nav className="pagination" aria-label="Product pages">
                  <button
                    disabled={products.data.page <= 1}
                    onClick={() =>
                      update("page", String(products.data!.page - 1))
                    }
                  >
                    Previous
                  </button>
                  <span>
                    Page {products.data.page} of {products.data.pages}
                  </span>
                  <button
                    disabled={products.data.page >= products.data.pages}
                    onClick={() =>
                      update("page", String(products.data!.page + 1))
                    }
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
