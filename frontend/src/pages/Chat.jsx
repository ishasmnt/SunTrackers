import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import LanguageContext from "../context/LanguageContext";
import "../styles/Chat.css";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/analysis", "/profile"];

export const NAVIGATION_PAGES = [
  { 
    route: "/home", 
    label: "🏠 Home", 
    description: "Main landing page with hero section, featured articles, and quick actions",
    keywords: ["home", "landing", "welcome", "hero", "main"]
  },
  { 
    route: "/planner", 
    label: "☀️ Solar Calculator", 
    description: "Estimate solar savings, costs, payback period, CO₂ reduction",
    keywords: ["calculator", "calculate", "savings", "cost", "payback", "size", "sizing", "panel", "kw", "kwp", "roi"]
  },
  { 
    route: "/invest", 
    label: "🤝 Invest", 
    description: "Browse and invest in community solar projects",
    keywords: ["invest", "investment", "project", "fund", "funding", "community", "donate", "support"]
  },
  { 
    route: "/analysis", 
    label: "📊 Impact Dashboard", 
    description: "View real-time monitoring of solar installations (requires login)",
    keywords: ["analysis", "dashboard", "impact", "monitor", "monitoring", "data", "stats", "carbon", "co2", "realtime"],
    requiresAuth: true
  },
  { 
    route: "/articles", 
    label: "📚 Knowledge Center", 
    description: "Educational articles about solar energy, finance, and sustainability",
    keywords: ["article", "learn", "education", "read", "article", "knowledge", "guide", "tutorial"]
  },
  { 
    route: "/chat", 
    label: "💬 AI Chat", 
    description: "Talk to the AI assistant (current conversation)",
    keywords: ["chat", "talk", "ask", "question", "assistant", "ai", "help"]
  },
  { 
    route: "/login", 
    label: "🔐 Login", 
    description: "Sign in to access your account and track investments",
    keywords: ["login", "signin", "sign in", "account", "authenticate"]
  },
  { 
    route: "/profile", 
    label: "👤 Profile", 
    description: "View your investments, settings, and activity history (requires login)",
    keywords: ["profile", "account", "settings", "history", "my investments"],
    requiresAuth: true
  },
];

export default function Chat() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Solar Assistant for PowerWestJava.\n\nI can help you with:\n• Solar system sizing and costs\n• Investment opportunities\n• Energy savings calculations\n• West Java solar policies\n• Platform navigation\n\n💬 Saya juga bisa berbahasa Indonesia! Feel free to ask in English or Bahasa Indonesia.\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedPage, setSuggestedPage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  const boxRef = useRef(null);
  const firstRender = useRef(true);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, loading, showAuthPrompt]);

  // Detect which page is relevant based on user input
  const detectRelevantPage = (userInput) => {
    const inputLower = userInput.toLowerCase();
    
    for (const page of NAVIGATION_PAGES) {
      for (const keyword of page.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          return page;
        }
      }
    }
    return null;
  };

  // Navigate to a page with auth check
  const handleNavigate = (route) => {
    // Check if route requires authentication
    const page = NAVIGATION_PAGES.find(p => p.route === route);
    if (page?.requiresAuth && !isAuthenticated) {
      setPendingRoute(route);
      setShowAuthPrompt(true);
      setSuggestedPage(null);
      return;
    }
    
    navigate(route);
    setSuggestedPage(null);
    setShowAuthPrompt(false);
  };

  // Handle login button click
  const handleLoginClick = () => {
    navigate("/login");
    setShowAuthPrompt(false);
    setPendingRoute(null);
  };

  // Handle close auth prompt
  const closeAuthPrompt = () => {
    setShowAuthPrompt(false);
    setPendingRoute(null);
  };

  // Render content with navigation links
  const renderContent = (text, isLatestAssistantMessage = false) => {
    const lines = (text || "").split("\n");
    const blocks = [];
    let bullets = [];

    const flushBullets = () => {
      if (bullets.length) {
        blocks.push(
          <ul className="msgList" key={`ul-${blocks.length}`}>
            {bullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        );
        bullets = [];
      }
    };

    // Check for navigation link patterns like [Go to Calculator →](/planner)
    const navigationLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    lines.forEach((raw) => {
      const line = raw.trimEnd();

      if (!line.trim()) {
        flushBullets();
        blocks.push(<div className="msgSpacer" key={`sp-${blocks.length}`} />);
        return;
      }

      if (line.trim().startsWith("•")) {
        bullets.push(line.replace(/^•\s?/, ""));
        return;
      }

      flushBullets();

      // Check for navigation links in the line
      if (line.match(navigationLinkRegex)) {
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = navigationLinkRegex.exec(line)) !== null) {
          // Add text before the link
          if (match.index > lastIndex) {
            parts.push(<span key={`text-${parts.length}`}>{line.substring(lastIndex, match.index)}</span>);
          }
          
          // Add the navigation link
          const linkText = match[1];
          const linkRoute = match[2];
          
          parts.push(
            <button
              key={`nav-${parts.length}`}
              className="nav-link-button"
              onClick={() => handleNavigate(linkRoute)}
              title={`Navigate to ${linkText}`}
            >
              {linkText}
            </button>
          );
          
          lastIndex = navigationLinkRegex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < line.length) {
          parts.push(<span key={`text-${parts.length}`}>{line.substring(lastIndex)}</span>);
        }
        
        blocks.push(
          <p className="msgP" key={`p-${blocks.length}`}>
            {parts}
          </p>
        );
      } else {
        blocks.push(
          <p className="msgP" key={`p-${blocks.length}`}>
            {line}
          </p>
        );
      }
    });

    flushBullets();
    return blocks;
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    const userMsg = { role: "user", content: userInput };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Detect relevant page from user input
    const relevantPage = detectRelevantPage(userInput);
    if (relevantPage) {
      setSuggestedPage(relevantPage);
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const res = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (res.ok && data?.assistant) {
        setMessages((m) => [...m, data.assistant]);
      } else {
        const errMsg = data?.error || "Unknown error from chat endpoint";
        setMessages((m) => [...m, { role: "assistant", content: `❌ Error: ${errMsg}` }]);
      }
    } catch (err) {
      console.error("Chat request failed", err);
      setMessages((m) => [...m, { role: "assistant", content: "❌ Network error. Please try again." }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickQuestions = [
    "How much solar panel do I need?",
    "What's the payback period?",
    "Best districts for solar in West Java?",
    "How to start investing in solar?",
  ];

  const navigationSuggestions = [
    { route: "/planner", label: "☀️ Calculator", icon: "bi-calculator" },
    { route: "/invest", label: "🤝 Invest", icon: "bi-cash-coin" },
    { route: "/analysis", label: "📊 Dashboard", icon: "bi-bar-chart", requiresAuth: true },
    { route: "/articles", label: "📚 Articles", icon: "bi-book" },
  ];

  return (
    <div className="chatShell">
      <div className="chatCard">
        <div className="chatTop">
          <div className="chatTopIcon">
            <i className="bi bi-robot" />
          </div>
          <div className="chatTopText">
            <div className="chatTitle">{t?.chatTitle || "AI Solar Assistant"}</div>
            <div className="chatSub">{t?.chatSubtitle || "Your expert guide to renewable energy in West Java."}</div>
          </div>
        </div>

        <div className="chatDivider" />

        <div className="chatBody">
          {messages.length <= 1 && (
            <>
              <div className="hintRow">
                <div className="hintBubble">
                  <i className="bi bi-lightbulb" />
                  <span>
                    {t?.chatHint || "Try asking about"} <b>'payback period'</b> {t?.chatHint2 || "or"} <b>'West Java regulations'</b>.
                  </span>
                </div>
              </div>

              <div className="chipRow">
                {quickQuestions.map((q, i) => (
                  <button key={i} type="button" className="chip" onClick={() => setInput(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="chatBox" ref={boxRef}>
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isWelcome = !isUser && i === 0;
              const isLatestAssistant = !isUser && i === messages.length - 1;

              return (
                <div key={i} className={`msgRow ${isUser ? "user" : "ai"}`}>
                  {!isUser && (
                    <div className="avatar">
                      <i className="bi bi-robot" />
                    </div>
                  )}

                  <div className={`bubble ${isUser ? "bubbleUser" : "bubbleAi"} ${isWelcome ? "bubbleWelcome" : ""}`}>
                    {renderContent(m.content, isLatestAssistant)}
                  </div>

                  {isUser && (
                    <div className="avatar avatarUser">
                      <i className="bi bi-person-fill" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Authentication required prompt */}
            {showAuthPrompt && (
              <div className="msgRow ai">
                <div className="avatar">
                  <i className="bi bi-robot" />
                </div>
                <div className="bubble bubbleAi authPromptBubble">
                  <div className="authPrompt">
                    <div className="authPromptHeader">
                      <i className="bi bi-shield-lock"></i>
                      <span>Authentication Required</span>
                    </div>
                    <p className="authPromptText">
                      Please log in or create an account to access the Impact Dashboard and view real-time solar monitoring data.
                    </p>
                    <div className="authPromptButtons">
                      <button 
                        className="authPromptLoginBtn"
                        onClick={handleLoginClick}
                      >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Go to Login
                      </button>
                      <button 
                        className="authPromptCancelBtn"
                        onClick={closeAuthPrompt}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation suggestion button */}
            {suggestedPage && !loading && !showAuthPrompt && (
              <div className="msgRow ai">
                <div className="avatar">
                  <i className="bi bi-robot" />
                </div>
                <div className="bubble bubbleAi navSuggestionBubble">
                  <div className="navSuggestion">
                    <span className="navSuggestionText">
                      <i className="bi bi-arrow-right-circle"></i>
                      Would you like to explore <strong>{suggestedPage.label.replace(/[^a-zA-Z0-9 ]/g, '')}</strong>?
                    </span>
                    <button 
                      className="navSuggestionBtn"
                      onClick={() => handleNavigate(suggestedPage.route)}
                    >
                      Go to {suggestedPage.label} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="msgRow ai">
                <div className="avatar">
                  <i className="bi bi-robot" />
                </div>
                <div className="bubble bubbleAi bubbleTyping">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typingText">{t?.aiThinking || "AI is thinking..."}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick navigation bar */}
          <div className="quickNavBar">
            <span className="quickNavLabel">{t?.quickNavLabel || "Quick Navigation:"}</span>
            <div className="quickNavButtons">
              {navigationSuggestions.map((nav, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quickNavBtn ${nav.requiresAuth ? 'requires-auth' : ''}`}
                  onClick={() => handleNavigate(nav.route)}
                  title={nav.requiresAuth ? "Requires login to access" : `Navigate to ${nav.label}`}
                >
                  <i className={`bi ${nav.icon}`}></i>
                  <span>{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="composerCard">
            <div className="composerBar">
              <div className="composerField">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={t?.chatPlaceholder || "Ask about solar sizing, payback, investments, or navigation..."}
                  className="composerTextarea"
                  spellCheck={false}
                />
              </div>

              <button
                type="button"
                className="composerSend"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send"
                title="Send"
              >
                <i className={`bi ${loading ? "bi-hourglass-split" : "bi-send-fill"}`} />
              </button>
            </div>
          </div>

          <div className="infoBar">
            <i className="bi bi-info-circle" />
            <span>
              {t?.aiDisclaimer || "This AI assistant provides educational information. For official advice, consult certified solar professionals."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

