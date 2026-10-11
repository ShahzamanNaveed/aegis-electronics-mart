import { useEffect, useRef } from "react";
import { Link, NavLink, Routes, Route, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { Brand, NotFound } from "./common";
import { Home } from "../pages/Home";
import { Library } from "../pages/Library";
import { ArticlePage } from "../pages/ArticlePage";
import { Info } from "../pages/Info";
import { Storefront } from "../pages/Storefront";
import { Shop } from "../pages/Shop";
import { ProductPage } from "../pages/ProductPage";
import { Basket } from "../pages/Basket";
import { Compare } from "../pages/Compare";
import { CatalogSearch } from "../catalog/components";
import { useMart } from "../catalog/state";
import { ShoppingBag, Scale } from "lucide-react";
import { Assistant } from "./Assistant";

export function Layout() {
  const mart = useMart();
  const dialog = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  useEffect(() => {
    dialog.current?.close();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="utility">
        <div className="container">
          <span>
            Research storefront · Fictional products & sample prices · No real
            purchases
          </span>
          <Link to="/about">
            Meet Aegis <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
      <header>
        <div className="container header">
          <Brand />
          <div className="header-search">
            <CatalogSearch
              initial={new URLSearchParams(location.search).get("query") ?? ""}
            />
          </div>
          <nav aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/shop">Shop all</NavLink>
            <NavLink to="/help-center">Help Center</NavLink>
          </nav>
          <Link
            className="basket-link"
            to="/basket"
            aria-label={`Basket, ${mart.basket.reduce((n, i) => n + i.quantity, 0)} items`}
          >
            <ShoppingBag size={22} />
            <span>{mart.basket.reduce((n, i) => n + i.quantity, 0)}</span>
          </Link>
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => dialog.current?.showModal()}
          >
            <Menu />
          </button>
        </div>
      </header>
      <div className="department-nav">
        <div className="container">
          <Link to="/shop">All departments</Link>
          <Link to="/shop?department=refrigerators">Refrigerators</Link>
          <Link to="/shop?department=kitchen-essentials">
            Kitchen essentials
          </Link>
          <Link to="/shop?department=smartphones">Phones</Link>
          <Link to="/shop?department=laptops">Laptops</Link>
          <Link to="/shop?department=audio">Audio</Link>
          <Link to="/compare">
            <Scale size={15} />
            Compare ({mart.compare.length})
          </Link>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="mobile-dialog"
        aria-label="Site navigation"
      >
        <div>
          <Brand />
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[
            ["/", "Home"],
            ["/shop", "Shop all"],
            ["/compare", "Compare products"],
            ["/basket", "Your basket"],
            ["/help-center", "Help Center"],
            ["/help", "Help library"],
            ["/about", "About Aegis"],
          ].map(([url, label]) => (
            <Link key={url} to={url} onClick={() => dialog.current?.close()}>
              {label}
              <ArrowRight size={18} />
            </Link>
          ))}
        </nav>
      </dialog>
      <main id="main">
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/help-center" element={<Home />} />
          <Route path="/help" element={<Library />} />
          <Route path="/help/category/:slug" element={<Library />} />
          <Route path="/help/articles/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<Info />} />
          <Route path="/privacy" element={<Info privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div
        className="mart-notice"
        role="status"
        aria-live="polite"
        key={mart.notice}
      >
        {mart.notice}
      </div>
      <footer>
        <div className="container footer-main">
          <div>
            <Brand />
            <p>
              Good things for your home.
              <br />
              Thoughtful details for your everyday.
            </p>
          </div>
          <div>
            <h2>Find your way</h2>
            <Link to="/shop">Explore the collection</Link>
            <Link to="/compare">Compare products</Link>
            <Link to="/help">Help library</Link>
            <Link to="/help?topic=setup">Getting started</Link>
            <Link to="/help?topic=care">Care & upkeep</Link>
          </div>
          <div>
            <h2>About the portal</h2>
            <Link to="/about">The Aegis project</Link>
            <Link to="/privacy">Privacy</Link>
            <span className="footer-note">An independent research portal.</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Aegis Electronics Mart</span>
          <span>Thoughtful help. Everyday confidence.</span>
        </div>
      </footer>
      <Assistant />
    </>
  );
}
