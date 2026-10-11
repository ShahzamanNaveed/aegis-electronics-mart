import { Link, useParams } from "react-router-dom";
import { BookOpen, Package, ShieldCheck, Truck } from "lucide-react";
import { ApiError } from "../api";
import { Title, Loading, NotFound } from "../components/common";
import { useProduct, useProducts, money } from "../catalog/api";
import { ProductArt } from "../catalog/ProductArt";
import {
  CatalogFailure,
  ProductActions,
  ProductCard,
  ShopBreadcrumb,
} from "../catalog/components";

function Related({
  department,
  exclude,
}: {
  department: string;
  exclude: string;
}) {
  const result = useProducts("department=" + department + "&page_size=5");
  if (!result.data) return null;
  return (
    <section className="container section related">
      <div className="section-heading">
        <h2>Explore the rest of the range.</h2>
        <Link className="text-link" to={"/shop?department=" + department}>
          View department →
        </Link>
      </div>
      <div className="products-grid">
        {result.data.items
          .filter((p) => p.slug !== exclude)
          .slice(0, 4)
          .map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
      </div>
    </section>
  );
}
export function ProductPage() {
  const { slug = "" } = useParams();
  const result = useProduct(slug);
  if (result.isPending) return <Loading />;
  if (result.isError)
    return result.error instanceof ApiError && result.error.status === 404 ? (
      <NotFound />
    ) : (
      <CatalogFailure retry={() => result.refetch()} />
    );
  const p = result.data;
  return (
    <>
      <Title title={p.name} />
      <div className="container">
        <ShopBreadcrumb label={p.name} />
        <div className="product-detail">
          <div className="detail-visual">
            <ProductArt department={p.department} color={p.color} />
            <span>Category illustration · {p.color}</span>
          </div>
          <div className="detail-summary">
            <span className="eyebrow">
              {p.brand.toUpperCase()} / {p.sku}
            </span>
            <h1>{p.name.replace(p.brand + " ", "")}</h1>
            <p className="detail-subtitle">{p.summary}</p>
            <div className="detail-price">
              {money(p.price_paisa)}
              <span>Sample price · product only</span>
            </div>
            <span className={"availability " + (!p.stock ? "unavailable" : "")}>
              {p.stock
                ? `In stock · ${p.stock} in sample inventory`
                : "Currently out of stock"}
            </span>
            <ul className="product-highlights">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="color-choice">
              <span>Finish</span>
              <strong>{p.color}</strong>
            </div>
            <ProductActions product={p} />
            <p className="demo-note">
              Research storefront: all brands, products, prices, and stock are
              fictional. No payment or fulfillment takes place.
            </p>
            <div className="detail-assurances">
              <span>
                <Truck size={18} />
                Sample 3–5 day delivery
              </span>
              <span>
                <ShieldCheck size={18} />
                Limited sample warranty
              </span>
              <span>
                <Package size={18} />
                Box contents listed below
              </span>
            </div>
          </div>
        </div>
        <nav className="product-tabs" aria-label="Product information">
          <a href="#overview">Overview</a>
          <a href="#specifications">Specifications</a>
          <a href="#included">In the box</a>
          <a href="#policies">Delivery & warranty</a>
          <a href="#questions">Questions & care</a>
        </nav>
        <div className="product-information">
          <section id="overview">
            <span className="eyebrow">GET TO KNOW YOUR NEXT EVERYDAY</span>
            <h2>A closer look.</h2>
            <p>{p.description}</p>
            <h3>Compatibility & requirements</h3>
            <p>{p.compatibility}</p>
          </section>
          <section id="specifications">
            <h2>The details, clearly.</h2>
            <dl className="spec-table">
              {Object.entries(p.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>Finish</dt>
                <dd>{p.color}</dd>
              </div>
              <div>
                <dt>SKU</dt>
                <dd>{p.sku}</dd>
              </div>
              <div>
                <dt>Dataset</dt>
                <dd>Synthetic · mart-1.0</dd>
              </div>
            </dl>
          </section>
          <section id="included">
            <h2>What’s in the box?</h2>
            <ul>
              {p.in_box.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section id="policies">
            <h2>Know before you choose.</h2>
            <h3>Delivery</h3>
            <p>{p.delivery}</p>
            <h3>Warranty</h3>
            <p>{p.warranty}</p>
            <h3>Returns</h3>
            <p>{p.returns}</p>
          </section>
          <section id="questions">
            <h2>A few useful answers.</h2>
            {p.faqs.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
            <h3>Care for the everyday</h3>
            <ul>
              {p.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
          <section className="product-help">
            <BookOpen size={28} />
            <h2>A little more guidance.</h2>
            {p.help_slugs.map((s) => (
              <Link key={s} to={"/help/articles/" + s}>
                {s.replaceAll("-", " ")} →
              </Link>
            ))}
          </section>
        </div>
      </div>
      <Related department={p.department} exclude={p.slug} />
    </>
  );
}
