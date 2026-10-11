import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  SlidersHorizontal,
  Scale,
} from "lucide-react";
import { Title, Loading } from "../components/common";
import { ApplianceScene } from "../components/ApplianceScene";
import { useDepartments, useProducts } from "../catalog/api";
import { CatalogFailure, ProductCard } from "../catalog/components";
import { ProductArt } from "../catalog/ProductArt";

export function Storefront() {
  const departments = useDepartments();
  const products = useProducts("page_size=8&in_stock=true");
  return (
    <>
      <Title title="Aegis Electronics Mart" />
      <section className="mart-hero">
        <div className="container mart-hero-grid">
          <div>
            <span className="eyebrow">WELCOME TO AEGIS ELECTRONICS MART</span>
            <h1>
              Everyday living.
              <br />
              <em>Better equipped.</em>
            </h1>
            <p>
              From a fresher kitchen to a more connected day.
              <br />
              Discover appliances, electronics, and little essentials.
            </p>
            <Link className="button" to="/shop">
              Explore the collection <ArrowRight size={18} />
            </Link>
            <div className="hero-footnote">
              12 departments <span>•</span> 60 products <span>•</span> One place
              to explore
            </div>
          </div>
          <div className="mart-hero-art">
            <span className="art-label">
              A little upgrade. A lot of possibility.
            </span>
            <ApplianceScene />
            <span className="hero-art-note">THE EVERYDAY COLLECTION / 01</span>
          </div>
        </div>
      </section>
      <div className="mart-promises container">
        <span>
          <SlidersHorizontal size={20} /> Find your fit{" "}
          <small>Specs that make comparison easier</small>
        </span>
        <span>
          <Scale size={20} /> Consider your options{" "}
          <small>Compare up to three products</small>
        </span>
        <span>
          <BookOpen size={20} /> Get to know your device{" "}
          <small>Practical guides, all in one place</small>
        </span>
      </div>
      <section className="container section departments-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">GOOD THINGS FOR EVERY ROOM</span>
            <h2>What are you looking for?</h2>
          </div>
          <Link className="text-link" to="/shop">
            Shop all departments <ArrowRight size={17} />
          </Link>
        </div>
        {departments.isPending ? (
          <Loading />
        ) : departments.isError ? (
          <CatalogFailure retry={() => departments.refetch()} />
        ) : (
          <div className="department-grid">
            {departments.data.map((d) => (
              <Link
                className="department-card"
                to={"/shop?department=" + d.slug}
                key={d.slug}
              >
                <div>
                  <ProductArt department={d.slug} />
                </div>
                <h3>{d.name}</h3>
                <span>
                  {d.product_count} products <ArrowUpRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="collection-band">
        <div className="container collection-inner">
          <div>
            <span className="eyebrow">SMALL SPACE. BIG POSSIBILITIES.</span>
            <h2>
              Make more of
              <br />
              your everyday.
            </h2>
            <p>Countertop helpers that earn their place.</p>
            <Link className="button" to="/shop?department=kitchen-essentials">
              Explore kitchen essentials <ArrowRight size={17} />
            </Link>
          </div>
          <div className="collection-art">
            <ProductArt department="kitchen-essentials" color="Sage" />
            <ProductArt department="microwaves-ovens" />
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE EVERYDAY EDIT</span>
            <h2>A place to start exploring.</h2>
          </div>
          <Link className="text-link" to="/shop">
            View the full collection <ArrowRight size={17} />
          </Link>
        </div>
        {products.isPending ? (
          <Loading />
        ) : products.isError ? (
          <CatalogFailure retry={() => products.refetch()} />
        ) : (
          <div className="products-grid">
            {products.data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <section className="container closing">
        <div className="closing-icon">
          <BookOpen size={32} />
        </div>
        <div>
          <span className="eyebrow">SUPPORT THAT STAYS WITH YOU</span>
          <h2>New device. Familiar questions.</h2>
          <p>
            Find setup, care, delivery, and warranty guides in the Help Center.
          </p>
        </div>
        <Link className="button" to="/help-center">
          Visit the Help Center <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
