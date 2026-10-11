import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, BookOpen } from "lucide-react";
import { ApiError, useCategories, useArticles } from "../api";
import { topics } from "../topics";
import {
  Title,
  SearchBox,
  Loading,
  Failure,
  ArticleCard,
  Breadcrumb,
} from "../components/common";

export function Library() {
  const { slug } = useParams();
  const [search, setSearch] = useSearchParams();
  const query = search.get("query") ?? "";
  const topic = search.get("topic") ?? "";
  const category = slug ?? search.get("category") ?? "";
  const rawPage = Number(search.get("page") ?? 1);
  const page =
    Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 10000 ? rawPage : 1;
  const params = new URLSearchParams({
    query,
    page: String(page),
    page_size: "6",
  });
  if (category) params.set("category", category);
  if (topic) params.set("topic", topic);
  const categories = useCategories();
  const result = useArticles(params.toString());
  const name = categories.data?.find((c) => c.slug === category)?.name;
  function change(key: string, value: string) {
    const next = new URLSearchParams(search);
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setSearch(next);
  }
  return (
    <>
      <Title title={name ?? "Help library"} />
      <div className="library-hero">
        <div className="container">
          <Breadcrumb current={name ?? "Help library"} />
          <span className="eyebrow">ANSWERS, AT YOUR PACE</span>
          <h1>{name ? name + " help" : "The help library."}</h1>
          <p>
            Practical advice, from getting started to keeping things running.
          </p>
          <SearchBox initial={query} />
        </div>
      </div>
      <section className="container library-body">
        <aside className="filters">
          <h2>Make it easier to find</h2>
          <label htmlFor="category">Appliance category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => change("category", e.target.value)}
            disabled={Boolean(slug) || categories.isPending}
          >
            <option value="">All appliances</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {slug && (
            <Link className="text-link" to="/help">
              View all categories <ArrowRight size={14} />
            </Link>
          )}
          <label htmlFor="topic">What do you need?</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => change("topic", e.target.value)}
          >
            <option value="">All topics</option>
            {topics.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="filter-note">
            <BookOpen size={23} />
            <p>A helpful starting point.</p>
            <span>
              For model-specific instructions, always check your appliance
              manual.
            </span>
          </div>
        </aside>
        <div className="results">
          <div className="results-heading">
            <h2>
              {query ? "Results for “" + query + "”" : (name ?? "All guides")}
            </h2>
            <span aria-live="polite">
              {result.data
                ? result.data.total +
                  (result.data.total === 1 ? " guide" : " guides")
                : ""}
            </span>
          </div>
          {result.isPending ? (
            <Loading />
          ) : result.isError ? (
            result.error instanceof ApiError &&
            [404, 422].includes(result.error.status) ? (
              <div className="status">
                <h2>That filter isn’t available.</h2>
                <Link className="button" to="/help">
                  Browse all guides
                </Link>
              </div>
            ) : (
              <Failure retry={() => result.refetch()} />
            )
          ) : result.data.items.length === 0 ? (
            <div className="status">
              <Search size={30} />
              <h2>No guides found.</h2>
              <p>Try a shorter search or a different topic.</p>
              <Link className="button" to="/help">
                Browse all guides
              </Link>
            </div>
          ) : (
            <>
              <div className="article-grid library-grid">
                {result.data.items.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              {result.data.pages > 1 && (
                <nav className="pagination" aria-label="Results pages">
                  <button
                    disabled={page === 1}
                    onClick={() => change("page", String(page - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {result.data.pages}
                  </span>
                  <button
                    disabled={page >= result.data.pages}
                    onClick={() => change("page", String(page + 1))}
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
