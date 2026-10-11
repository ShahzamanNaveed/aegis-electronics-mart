import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import type { Article } from "../api";
import { topics } from "../topics";

export function SearchBox({
  initial = "",
  large = false,
}: {
  initial?: string;
  large?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <form
      className={"search " + (large ? "search-large" : "")}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = String(
          new FormData(e.currentTarget).get("query") ?? "",
        ).trim();
        navigate(
          "/help" + (query ? "?query=" + encodeURIComponent(query) : ""),
        );
      }}
    >
      <Search size={21} aria-hidden="true" />
      <label
        className="sr-only"
        htmlFor={large ? "hero-search" : "help-search"}
      >
        Search help articles
      </label>
      <input
        key={initial}
        id={large ? "hero-search" : "help-search"}
        name="query"
        defaultValue={initial}
        maxLength={120}
        placeholder="What can we help you with?"
      />
      <button type="submit">
        Search <ArrowRight size={17} />
      </button>
    </form>
  );
}

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Aegis home">
      <span className="brand-mark">a</span>aegis
      <span className="brand-caption">ELECTRONICS MART</span>
    </Link>
  );
}

export function Title({ title }: { title: string }) {
  useEffect(() => {
    document.title = title + " · Aegis";
  }, [title]);
  return null;
}

export function Loading() {
  return (
    <div className="status" role="status">
      <span className="spinner" />
      Loading helpful answers…
    </div>
  );
}

export function Failure({ retry }: { retry: () => void }) {
  return (
    <div className="status" role="alert">
      <BookOpen />
      <h2>The library is taking a moment.</h2>
      <p>We couldn’t load these guides. Please try again.</p>
      <button className="button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function ArticleCard({
  article,
  index,
}: {
  article: Article;
  index?: number;
}) {
  return (
    <Link className="article-card" to={"/help/articles/" + article.slug}>
      <div className="card-top">
        <span className="tag">
          {topics.find((t) => t[0] === article.topic)?.[1]}
        </span>
        {index !== undefined && (
          <span className="article-number">0{index + 1}</span>
        )}
      </div>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <div className="card-bottom">
        <span>
          {article.category_name} <span className="dot">·</span>{" "}
          {article.reading_minutes} min read
        </span>
        <ArrowUpRight size={20} />
      </div>
    </Link>
  );
}

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <ChevronRight size={13} />
      <Link to="/help">Help library</Link>
      {current !== "Help library" && (
        <>
          <ChevronRight size={13} />
          <span aria-current="page">{current}</span>
        </>
      )}
    </nav>
  );
}

export function NotFound() {
  return (
    <div className="container status not-found">
      <Title title="Page not found" />
      <span className="eyebrow">404 / A LITTLE DETOUR</span>
      <h1>Let’s find your way back.</h1>
      <p>This page may have moved, or the address may be incorrect.</p>
      <Link className="button" to="/help">
        Go to the help library <ArrowRight size={17} />
      </Link>
    </div>
  );
}
