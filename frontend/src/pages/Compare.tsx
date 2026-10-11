import { Link } from "react-router-dom";
import { Title, Loading } from "../components/common";
import { money, useSelection } from "../catalog/api";
import { useMart } from "../catalog/state";
import { ProductArt } from "../catalog/ProductArt";
import { ProductActions, ShopBreadcrumb } from "../catalog/components";
export function Compare() {
  const mart = useMart();
  const selected = useSelection(mart.compare);
  const keys = Array.from(
    new Set(selected.data?.flatMap((p) => Object.keys(p.specifications)) ?? []),
  );
  return (
    <div className="container compare-page">
      <Title title="Compare products" />
      <ShopBreadcrumb label="Compare" />
      <div className="shop-heading">
        <div>
          <span className="eyebrow">SIDE BY SIDE. CLEARER CHOICES.</span>
          <h1>Find what fits.</h1>
          <p>
            Compare up to three products. A dash means that specification is not
            listed.
          </p>
        </div>
      </div>
      {mart.compare.length === 0 ? (
        <div className="status">
          <h2>Start with a couple of possibilities.</h2>
          <p>Select Compare on any product to add it here.</p>
          <Link className="button" to="/shop">
            Explore products
          </Link>
        </div>
      ) : selected.isPending ? (
        <Loading />
      ) : selected.isError ? (
        <div className="status" role="alert">
          <h2>We couldn’t load your comparison.</h2>
          <button className="button" onClick={() => selected.refetch()}>
            Try again
          </button>
          {mart.compare.map((s) => (
            <button
              className="outline-button"
              key={s}
              onClick={() => mart.toggleCompare(s)}
            >
              Remove {s}
            </button>
          ))}
        </div>
      ) : (
        <div
          className="compare-scroll"
          role="region"
          aria-label="Product comparison table"
          tabIndex={0}
        >
          <table className="compare-table">
            <caption className="sr-only">
              Selected product specifications
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  Your shortlist{" "}
                  <small>{selected.data.length} of 3 products</small>
                </th>
                {selected.data.map((p) => (
                  <th scope="col" key={p.id}>
                    <ProductArt department={p.department} color={p.color} />
                    <Link to={"/products/" + p.slug}>{p.name}</Link>
                    <button
                      className="text-button"
                      onClick={() => mart.toggleCompare(p.slug)}
                      aria-label={"Remove " + p.name + " from comparison"}
                    >
                      Remove
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Price</th>
                {selected.data.map((p) => (
                  <td key={p.id}>
                    <strong>{money(p.price_paisa)}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Availability</th>
                {selected.data.map((p) => (
                  <td key={p.id}>{p.stock ? "In stock" : "Out of stock"}</td>
                ))}
              </tr>
              {keys.map((key) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  {selected.data.map((p) => (
                    <td key={p.id}>{p.specifications[key] ?? "—"}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Warranty</th>
                {selected.data.map((p) => (
                  <td key={p.id}>{p.warranty}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Your next step</th>
                {selected.data.map((p) => (
                  <td key={p.id}>
                    <ProductActions product={p} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
