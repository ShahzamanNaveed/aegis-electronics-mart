import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck, BookOpen } from "lucide-react";
import { ApiError, useArticle } from "../api";
import { topics } from "../topics";
import {
  Title,
  Loading,
  Failure,
  ArticleCard,
  Breadcrumb,
  NotFound,
} from "../components/common";

export function ArticlePage() {
  const { slug = "" } = useParams();
  const result = useArticle(slug);
  if (result.isPending) return <Loading />;
  if (result.isError)
    return result.error instanceof ApiError && result.error.status === 404 ? (
      <NotFound />
    ) : (
      <Failure retry={() => result.refetch()} />
    );
  const a = result.data;
  return (
    <>
      <Title title={a.title} />
      <div className="container">
        <Breadcrumb current={a.category_name} />
      </div>
      <article className="container article-layout">
        <aside className="article-toc">
          <span className="eyebrow">IN THIS GUIDE</span>
          {a.sections.map((s, i) => (
            <a key={s.heading} href={"#section-" + i}>
              {s.heading}
            </a>
          ))}
          <Link className="text-link" to={"/help/category/" + a.category_slug}>
            More {a.category_name.toLowerCase()} help <ArrowRight size={14} />
          </Link>
        </aside>
        <div className="article-content">
          <span className="tag">
            {topics.find((t) => t[0] === a.topic)?.[1]}
          </span>
          <h1>{a.title}</h1>
          <p className="article-lead">{a.excerpt}</p>
          <div className="article-meta">
            <span>
              <Clock size={15} />
              {a.reading_minutes} min read
            </span>
            <span>
              Updated{" "}
              {new Date(a.updated_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {a.sections.map((s, i) => (
            <section
              className="article-section"
              id={"section-" + i}
              key={s.heading}
            >
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets.length > 0 && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {s.note && (
                <div className="article-note">
                  <ShieldCheck size={22} />
                  <p>{s.note}</p>
                </div>
              )}
            </section>
          ))}
          <div className="article-end">
            <BookOpen size={22} />
            <p>
              Keep the right guide close.
              <br />
              <span>
                Your product’s manual is the best source for model-specific
                details.
              </span>
            </p>
          </div>
        </div>
      </article>
      {a.related.length > 0 && (
        <section className="container section related">
          <div className="section-heading">
            <h2>A little more help.</h2>
            <Link className="text-link" to="/help">
              All guides <ArrowRight size={16} />
            </Link>
          </div>
          <div className="article-grid">
            {a.related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
