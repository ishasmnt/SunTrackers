import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import "../styles/Analysis.css";
import SchoolView from "../components/SchoolView";
import AdminView from "../components/AdminView";
import LanguageContext from "../context/LanguageContext";

export default function Analysis() {
  const { t } = useContext(LanguageContext);
  const [view, setView] = useState("dynamic");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔐 Protect Route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  const handleShare = () => {
    const currentUrl = window.location.origin + "/analysis";

    const message =
      view === "adminDynamic"
        ? `📊 West Java Government is scaling renewable energy! 331 units and counting. Track our progress: ${currentUrl}`
        : `🌿 Check out how West Java schools are hitting 69.3% Solar Independence! View the impact here: ${currentUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const toggleBtnStyle = (active) => ({
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    background: active ? "white" : "transparent",
    color: active ? "#2e7d32" : "#666",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: active ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
  });

  return (
    <div className="analysisPage">
      <div className="analysisHeader">
        <div className="analysisTitleWrap">
          <h1 style={{ margin: 0 }}>
            <i className="bi bi-graph-up"></i>{" "}
            {t?.impactDashboard || "Impact Dashboard"}
          </h1>
          <p style={{ margin: 0 }}>
            {t?.analysisSubtitle ||
              "Real-time monitoring of West Java's transition to sustainable energy."}
          </p>
        </div>

        <div className="analysisActions">
          <button onClick={handleShare} className="analysisShareBtn">
            {t?.shareWhatsApp || "Share to WhatsApp"}
          </button>

          <div className="analysisToggle">
            <button
              onClick={() => setView("dynamic")}
              style={toggleBtnStyle(view === "dynamic")}
            >
              {t?.viewSchool || "School"}
            </button>

            <button
              onClick={() => setView("adminDynamic")}
              style={toggleBtnStyle(view === "adminDynamic")}
            >
              {t?.viewAdmin || "Admin"}
            </button>
          </div>
        </div>
      </div>

      <div className="analysisCard">
        {view === "dynamic" && <SchoolView />}
        {view === "adminDynamic" && <AdminView />}
      </div>

      <div className="analysisMeta">
        <small>
          <strong>{t?.dataMeta || "Data Meta-Tag"}:</strong> Source: West Java
          ESDM | Verification: PLN S-2 Tariff | Last Updated: Dec 2024
        </small>
      </div>
    </div>
  );
}
