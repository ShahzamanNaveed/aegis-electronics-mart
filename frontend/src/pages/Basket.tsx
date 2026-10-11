import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { Title, Loading } from "../components/common";
import { useQuote, money } from "../catalog/api";
import { useMart } from "../catalog/state";
import { ProductArt } from "../catalog/ProductArt";
import { ShopBreadcrumb } from "../catalog/components";

export function Basket() {
  const mart = useMart();
  const quote = useQuote(mart.basket);
  return (
    <div className="container basket-page">
      <Title title="Your basket" />
      <ShopBreadcrumb label="Your basket" />
      <div className="shop-heading">
        <div>
          <span className="eyebrow">BRING YOUR EVERYDAY TOGETHER</span>
          <h1>Your basket.</h1>
          <p>
            A place to consider your picks. Prices and availability are checked
            against the catalog.
          </p>
        </div>
      </div>
      {mart.storageFailed && (
        <p role="alert">
          Browser storage is unavailable. Your basket will only last for this
          visit.
        </p>
      )}
      {mart.basket.length === 0 ? (
        <div className="status">
          <ShoppingBag size={35} />
          <h2>A little room for something useful.</h2>
          <p>Your basket is empty.</p>
          <Link className="button" to="/shop">
            Explore the collection
          </Link>
        </div>
      ) : quote.isPending ? (
        <Loading />
      ) : quote.isError ? (
        <div className="status" role="alert">
          <h2>Your basket needs a refresh.</h2>
          <p>
            A product may be unavailable, or the catalog could not be reached.
          </p>
          <button className="button" onClick={() => quote.refetch()}>
            Try again
          </button>
          {mart.basket.map((i) => (
            <button
              className="outline-button"
              key={i.slug}
              onClick={() => mart.remove(i.slug)}
            >
              Remove {i.slug}
            </button>
          ))}
          <button className="text-button" onClick={mart.clear}>
            Clear basket
          </button>
        </div>
      ) : (
        <div className="basket-grid">
          <div>
            {quote.data.lines.map((line) => (
              <article className="basket-line" key={line.product.slug}>
                <Link
                  to={"/products/" + line.product.slug}
                  className="basket-art"
                  aria-label={"View " + line.product.name}
                >
                  <ProductArt
                    department={line.product.department}
                    color={line.product.color}
                  />
                </Link>
                <div className="basket-line-info">
                  <span className="product-brand">{line.product.brand}</span>
                  <h2>
                    <Link to={"/products/" + line.product.slug}>
                      {line.product.name}
                    </Link>
                  </h2>
                  <p>
                    {money(line.product.price_paisa)} each ·{" "}
                    {line.product.color}
                  </p>
                  <label>
                    Quantity for {line.product.name}
                    <select
                      aria-label={"Quantity for " + line.product.name}
                      value={line.quantity}
                      onChange={(e) =>
                        mart.quantity(line.product.slug, Number(e.target.value))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!line.available && (
                    <p className="stock-warning" role="alert">
                      Only {line.product.stock} available. Reduce the quantity
                      or remove this product.
                    </p>
                  )}
                </div>
                <div className="basket-line-total">
                  <strong>{money(line.line_total_paisa)}</strong>
                  <button
                    className="text-button"
                    onClick={() => mart.remove(line.product.slug)}
                    aria-label={"Remove " + line.product.name}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </article>
            ))}
            <Link className="text-link" to="/shop">
              ← Continue exploring
            </Link>
            <button className="text-button clear-basket" onClick={mart.clear}>
              Clear basket
            </button>
          </div>
          <aside className="basket-summary">
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>Basket summary</h2>
            <div>
              <span>Items</span>
              <strong>
                {mart.basket.reduce((sum, i) => sum + i.quantity, 0)}
              </strong>
            </div>
            <div>
              <span>Product subtotal</span>
              <strong>{money(quote.data.subtotal_paisa)}</strong>
            </div>
            <p>Delivery and installation are not included in this estimate.</p>
            <div className="basket-demo">
              <strong>A research shopping experience</strong>
              <p>
                This basket saves your selection on this browser. It does not
                reserve stock or create an order. This research storefront does
                not accept payments or submit orders.
              </p>
            </div>
            <Link className="outline-button" to="/compare">
              Review your comparison
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
