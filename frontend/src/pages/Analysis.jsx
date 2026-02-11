import React, { useState, useContext } from "react";
import "../styles/Analysis.css";
import SchoolView from "../components/SchoolView";
import AdminView from "../components/AdminView";
import LanguageContext from "../context/LanguageContext";

export default function Analysis() {
  const { t } = useContext(LanguageContext);
  const [view, setView] = useState("dynamic");

  const handleShare = () => {
    const currentUrl = window.location.href;

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
          <h1 style={{ margin: 0 }}><i className="bi bi-graph-up"></i> {t?.impactDashboard || "Impact Dashboard"}</h1>
          <p style={{ margin: 0 }}>
            {t?.analysisSubtitle || "Real-time monitoring of West Java's transition to sustainable energy. Track savings, generation, & environmental impact."}
          </p>
        </div>

        <div className="analysisActions">
          <button onClick={handleShare} className="analysisShareBtn">
            {t?.shareWhatsApp || "Share to WhatsApp"}
          </button>

          <div className="analysisToggle">
            <button
              onClick={() => setView("dynamic")}
              className={`analysisToggleBtn ${view === "dynamic" ? "analysisToggleBtnActive" : ""}`}
              style={toggleBtnStyle(view === "dynamic")}
            >
              {t?.viewSchool || "School"}
            </button>

            <button
              onClick={() => setView("adminDynamic")}
              className={`analysisToggleBtn ${view === "adminDynamic" ? "analysisToggleBtnActive" : ""}`}
              style={toggleBtnStyle(view === "adminDynamic")}
            >
              {t?.viewAdmin || "Admin"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="analysisCard"
        style={{
          padding: "0",
          overflow: "hidden",
          minHeight: "500px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {view === "dynamic" && <SchoolView />}
        {view === "adminDynamic" && <AdminView />}
      </div>

      <div
        className="analysisMeta"
        style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          borderLeft: "5px solid #2e7d32",
        }}
      >
        <small style={{ color: "#555" }}>
          <strong>{t?.dataMeta || "Data Meta-Tag"}:</strong> Source: West Java ESDM | Verification: PLN S-2 Tariff | Last Updated: Dec 2024
        </small>
      </div>
    </div>
  );
}