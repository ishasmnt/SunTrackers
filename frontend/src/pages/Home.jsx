import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { articles } from "../data/articlesData";
import LanguageContext from "../context/LanguageContext";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleAnalysisClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate("/analysis");
  };

  const goLogin = () => {
    setShowAuthModal(false);
    navigate("/login");
  };
  const featuredArticles = articles.slice(0, 3);
  return (
    <div className="homePage">
      <section className="hero">
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroBadge">{t?.heroBadge || "Dream West Java Progressing Towards Reality"}</div>

          <h1 className="heroTitle">
            {t?.heroTitle || "Welcome to the"} <span>{t?.cleanEnergy || "Green Future"}</span>
          </h1>

          <p className="heroSubtitle">
            {t?.heroSubtitle || "Empowering communities with sustainable solar energy solutions. Calculate savings, invest in local projects, and track our collective impact."}
          </p>

          <div className="heroActions">
            <Link to="/analysis" className="heroBtn heroBtnPrimary">
              {t?.exploreSolutions || "Explore Solutions"} <span aria-hidden="true">→</span>
            </Link>

            <Link to="/solarExplanation" className="heroBtn heroBtnGhost">
              {t?.seeExplanation || "See Explanation"}
            </Link>
          </div>
        </div>

        <div className="heroWave" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64 C240,120 480,0 720,48 C960,96 1200,64 1440,24 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      <main className="content">
        <section className="infoCard">
          <div className="infoLeft">
            <p className="infoKicker">{t?.howSolarWorks || "HOW SOLAR WORKS"}</p>
            <h2 className="infoTitle">
              {t?.harnessSun || "Harness the"} <span>{t?.cleanEnergy || "Sun's Power"}</span>.
            </h2>
            <p className="infoText">
              {t?.solarDescription || "Solar panels convert sunlight into DC electricity. An inverter converts this into AC electricity, which powers your home. Excess energy flows back to the grid or charges your battery, ensuring you always have power when you need it."}
            </p>

            <div className="infoPills">
              <div className="pill"><i className="bi bi-sun-fill"></i> {t?.cleanEnergy || "Clean Energy"}</div>
              <div className="pill"><i className="bi bi-piggy-bank-fill"></i> {t?.costSavings || "Cost Savings"}</div>
            </div>

            <div className="infoActions">
              <Link to="/solarExplanation" className="infoBtn infoBtnPrimary">
                {t?.readMore || "Read More"} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="infoRight">
            <img
              className="infoImage"
              src="/Home_SolarPanelBackground.png"
              alt="How solar works illustration"
            />
          </div>
        </section>

        <div className="homeGrid">
          <div className="homeCard homeCard--orange">
            <div className="homeCardIcon" aria-hidden="true">
              <i className="bi bi-sun-fill"></i>
            </div>

            <div className="homeCardDeco" aria-hidden="true">
              <i className="bi bi-calculator"></i>
            </div>

            <h2 className="homeCardTitle">{t?.planSolar || "Plan Solar"}</h2>
            <p className="homeCardText">
              {t?.planSolarText || "Calculate potential costs & savings for your school or home. Get a personalized estimate tailored to West Java's sunlight data"}
            </p>
            <Link to="/planner">
              <button className="homeBtn" type="button">{t?.openCalculator || "Open Calculator"}</button>
            </Link>
          </div>

          <div className="homeCard homeCard--green">
            <div className="homeCardIcon" aria-hidden="true">
              <i className="bi bi-coin"></i>
            </div>

            <div className="homeCardDeco" aria-hidden="true">
              <i className="bi bi-cash-stack"></i>
            </div>

            <h2 className="homeCardTitle">{t?.investTitle || "Invest"}</h2>
            <p className="homeCardText">
              {t?.investText || "Fund community solar projects and earn green returns. Empower local growth while contributing to a sustainable grid."}
            </p>
            <Link to="/invest">
              <button className="homeBtn" type="button">{t?.browseProjects || "Browse Projects"}</button>
            </Link>
          </div>

          <div className="homeCard homeCard--blue">
            <div className="homeCardIcon" aria-hidden="true">
              <i className="bi bi-graph-up-arrow"></i>
            </div>

            <div className="homeCardDeco" aria-hidden="true">
              <i className="bi bi-bar-chart-line"></i>
            </div>

            <h2 className="homeCardTitle">{t?.impactAnalysis || "Impact Analysis"}</h2>
            <p className="homeCardText">
              {t?.impactText || "Track West Java's carbon reduction progress visually. See real-time data on energy generation and environmental benefits."}
            </p>
            <button className="homeBtn homeBtn--primary" onClick={handleAnalysisClick} type="button">
              {t?.viewDashboard || "View Dashboard"}
            </button>
          </div>
        </div>

        <section className="insightsSection">
          <div className="insightsHeader">
            <div>
              <p className="insightsKicker">{t?.knowledgeCenter || "KNOWLEDGE CENTER"}</p>
              <h2 className="insightsTitle">{t?.solarInsights || "Solar Insights"}</h2>
              <p className="insightsSubtitle">
                {t?.insightsSubtitle || "Stay updated with the latest in solar technology, community stories, and sustainable living tips in West Java."}
              </p>
            </div>

            <Link to="/articles" className="insightsViewAll">
              {t?.viewAllArticles || "View All Articles →"}
            </Link>
          </div>

          <div className="insightsGrid">
            {featuredArticles.map((item) => (
              <article className="insightCard" key={item.slug}>
                <div className="insightImageWrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="insightImage"
                  />
                  <span className={`insightBadge insightBadge--${item.category.toLowerCase()}`}>
                    {item.category}
                  </span>
                </div>

                <div className="insightContent">
                  <h3 className="insightTitle">{item.title}</h3>
                  <p className="insightText">{item.description}</p>

                  <div className="insightMeta">
                    <span>{item.date} | {item.readTime}</span>
                    <Link to={`/articles/${item.slug}`} className="insightRead">
                      Read →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="homeFooter">
          <p>Logged in securely via Firebase</p>
        </div>
      </main>

      {showAuthModal && (
        <div className="authModalOverlay" role="dialog" aria-modal="true" onClick={() => setShowAuthModal(false)}>
          <div className="authModal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="authModalClose" onClick={() => setShowAuthModal(false)} aria-label="Close">
              x
            </button>
            <h2 className="authModalTitle">Please sign in</h2>
            <p className="authModalText">You need to log in to access Analysis.</p>
            <div className="authModalActions">
              <button type="button" className="authBtn authBtnPrimary" onClick={goLogin}>Login</button>
              <button type="button" className="authBtn authBtnGhost" onClick={() => setShowAuthModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}