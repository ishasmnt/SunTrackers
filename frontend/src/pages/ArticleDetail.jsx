import { useParams } from "react-router-dom";
import { articles } from "../data/articlesData";
import { Link } from "react-router-dom";
import "../styles/ArticleDetail.css";

export default function ArticleDetail() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  if (!article) return <p>Article not found.</p>;

  const relatedArticles = articles
    .filter((a) => a.slug !== slug)
    .slice(0, 6);

  return (
    <div className="article-detail">
        <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
            <i className="bi bi-house"></i> Home
            </Link>
            <span className="separator"> / </span>
            <Link to="/articles" className="breadcrumb-link">
            Articles
            </Link>
            <span className="separator"> / </span>
            <span className="current">{article.title}</span>
        </nav>
        <div className="video-wrapper">
            <iframe
            src={`https://www.youtube.com/embed/${article.videoId}`}
            title={article.title}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            />
        </div>
        <div className="article-header">
            <h1>{article.title}</h1>
            <a
                href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="wa-share"
                title="Share to WhatsApp"
            >
                <i className="bi bi-whatsapp"></i>
            </a>
        </div>
        <div className="article-body">
            <div className="article-main">
            <div className="article-content">
                {article.content.map((block, idx) => {
                switch (block.type) {
                    case "heading":
                    return <h2 key={idx} className="article-content h2">{block.text}</h2>;
                    case "quote":
                    return <blockquote key={idx}>{block.text}</blockquote>;
                    default:
                    return <p key={idx}>{block.text}</p>;
                }
                })}
            </div>
            </div>
            <aside className="article-sidebar">
                <h3>More Articles</h3>
                {relatedArticles.map((item, idx) => (
                    <a key={idx} href={`/articles/${item.slug}`}
                        className="related-card"
                    >
                    <img src={item.image} alt={item.title} />
                    <p>{item.title}</p>
                    </a>
                ))}
            </aside>

        </div>
    </div>
  );
}