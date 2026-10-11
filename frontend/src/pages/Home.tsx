import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Wind,
  Refrigerator,
  WashingMachine,
  CookingPot,
  Tv,
} from "lucide-react";
import { useCategories, useArticles } from "../api";
import { topics } from "../topics";
import {
  Title,
  SearchBox,
  Loading,
  Failure,
  ArticleCard,
} from "../components/common";
import { ApplianceScene } from "../components/ApplianceScene";
const icons = [Wind, Refrigerator, WashingMachine, CookingPot, Tv];

export function Home() {
  const categories = useCategories();
  const articles = useArticles("page_size=3");
  return (
    <>
      <Title title="Help for everyday living" />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> HERE FOR YOUR EVERYDAY
            </div>
            <h1>
              Good things.
              <br />A little <em>guidance.</em>
            </h1>
            <p>
              From the first unboxing to everyday upkeep.
              <br className="desktop-break" /> Find clear, practical help for
              the things you use most.
            </p>
            <SearchBox large />
            <div className="popular-searches">
              <span>Popular:</span>
              <Link to="/help?topic=delivery">Delivery</Link>
              <Link to="/help?topic=warranty">Warranty</Link>
              <Link to="/help?topic=setup">Getting started</Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-label">
              <Sparkles size={17} /> A happier home starts here.
            </div>
            <ApplianceScene />
            <div className="art-caption">
              <span>01 / EVERYDAY LIVING</span>
              <span>Made simpler.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR EVERYDAY</span>
            <h2>What’s in your home?</h2>
          </div>
          <Link className="text-link" to="/help">
            Explore all guides <ArrowRight size={17} />
          </Link>
        </div>
        {categories.isPending ? (
          <Loading />
        ) : categories.isError ? (
          <Failure retry={() => categories.refetch()} />
        ) : (
          <div className="category-grid">
            {categories.data.map((cat, i) => {
              const Icon = icons[i] ?? BookOpen;
              return (
                <Link
                  className="category-card"
                  to={"/help/category/" + cat.slug}
                  key={cat.id}
                >
                  <div className={"category-art tone-" + i}>
                    <Icon strokeWidth={1.1} />
                    <span className="small-spark" aria-hidden="true">
                      ✧
                    </span>
                  </div>
                  <h3>{cat.name}</h3>
                  <span>
                    {cat.article_count} guides <ArrowUpRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <section className="topic-section">
        <div className="container topic-layout">
          <div>
            <span className="eyebrow">ONE STEP AT A TIME</span>
            <h2>
              A hand with
              <br />
              the next step.
            </h2>
          </div>
          <div className="topic-grid">
            {topics.map(([slug, label, Icon]) => (
              <Link to={"/help?topic=" + slug} key={slug}>
                <Icon size={24} strokeWidth={1.5} />
                <span>{label}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A GOOD PLACE TO START</span>
            <h2>Small reads. Useful answers.</h2>
          </div>
          <Link className="text-link" to="/help">
            Visit the help library <ArrowRight size={17} />
          </Link>
        </div>
        {articles.isPending ? (
          <Loading />
        ) : articles.isError ? (
          <Failure retry={() => articles.refetch()} />
        ) : (
          <div className="article-grid">
            {articles.data.items.map((article, i) => (
              <ArticleCard article={article} index={i} key={article.id} />
            ))}
          </div>
        )}
      </section>
      <section className="container closing">
        <div className="closing-icon">
          <BookOpen size={34} strokeWidth={1.2} />
        </div>
        <div>
          <span className="eyebrow">LESS GUESSWORK. MORE CONFIDENCE.</span>
          <h2>A little know-how goes a long way.</h2>
          <p>Make the most of your appliances, one helpful guide at a time.</p>
        </div>
        <Link className="button" to="/help?topic=care">
          Explore care guides <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
