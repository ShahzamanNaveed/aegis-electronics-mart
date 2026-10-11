import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Title } from "../components/common";
export function Info({ privacy = false }: { privacy?: boolean }) {
  return (
    <div className="container info-page">
      <Title title={privacy ? "Privacy" : "About Aegis Electronics Mart"} />
      <span className="eyebrow">AEGIS ELECTRONICS MART</span>
      <h1>
        {privacy ? "Your privacy." : "Everyday products. A research purpose."}
      </h1>
      {privacy ? (
        <>
          <p>
            This research storefront does not require an account, use analytics,
            or set tracking cookies.
          </p>
          <h2>Your saved selections</h2>
          <p>
            The basket and comparison list are saved in this browser’s local
            storage. They contain product identifiers and quantities only.
            Remove selections on the basket or comparison page, or clear this
            site’s data in your browser. If browser storage is blocked,
            selections may last only for the current visit.
          </p>
          <h2>Search and basket estimates</h2>
          <p>
            Search terms and filters are sent to the server and appear in
            browser URLs and history. Basket identifiers and quantities are sent
            to calculate a current estimate. A quote does not create an order,
            reserve stock, or store your basket on the server.
          </p>
          <h2>What the server stores</h2>
          <p>
            The database holds synthetic products, inventory, specifications,
            and original help articles. No customer accounts, payments, orders,
            or conversations are stored in this iteration. Operational logs may
            contain request identifiers and technical details. Hosting providers
            may retain access logs according to their configuration.
          </p>
          <h2>External services</h2>
          <p>
            Artwork and interface assets are served locally. No AI provider is
            connected yet. Do not enter personal data or credentials into
            searches. This notice will be updated before introducing features
            that process customer information.
          </p>
        </>
      ) : (
        <>
          <p className="article-lead">
            A complete product story, from choosing the right device to
            understanding how to care for it.
          </p>
          <p>
            Aegis Electronics Mart brings appliances, electronics, essentials,
            comparisons, and practical help together. The current catalog
            contains 60 fictional products across 12 departments, with sample
            prices in PKR.
          </p>
          <h2>Built for the Aegis scanner</h2>
          <p>
            This is an independent final-year research project and a controlled
            target for evaluating LLM application security. All brands,
            products, specifications, prices, stock, warranties, and delivery
            terms are synthetic. Category illustrations do not represent exact
            product models.
          </p>
          <p>
            Browsing, comparison, and basket estimates work in this release.
            There are no real purchases, payments, deliveries, or repair
            bookings. The basket is a saved selection rather than an order.
          </p>
          <h2>A useful foundation for the assistant</h2>
          <p>
            Products carry structured specifications, compatibility details,
            FAQs, care instructions, policies, and linked help guides. This
            gives a future assistant a broad public knowledge source. Customer
            orders, staff-only information, and controlled security scenarios
            will be added as distinct, access-controlled modules.
          </p>
          <Link className="button" to="/shop">
            Explore the collection <ArrowRight size={17} />
          </Link>
        </>
      )}
    </div>
  );
}
