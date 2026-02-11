import React, { useEffect, useMemo, useState } from "react";
import "../styles/HowInvestmentWorks.css";

export default function HowInvestmentWorks() {
  const [open, setOpen] = useState(false);

  const steps = useMemo(
    () => [
      {
        no: "1",
        title: "Choose a project",
        sub: "Pick a school to support",
        icon: "bi bi-buildings",
      },
      {
        no: "2",
        title: "Invest",
        sub: "Start from Rp 500.000",
        icon: "bi bi-wallet2",
      },
      {
        no: "3",
        title: "Earn returns",
        sub: "Track progress anytime",
        icon: "bi bi-graph-up-arrow",
      },
    ],
    []
  );

  const sections = useMemo(
    () => [

 
  {
    title: "Phase 1: Solar Winding (The Setup)",
    desc: "We 'wind up' the project by collecting micro-investments from the community. Your money funds the actual hardware on the school roof.",
    icon: "bi bi-gear-wide-connected",
  },
  {
    title: "Phase 2: Solar Vending (The Earnings)",
    desc: "The school vends surplus electricity to the neighborhood. This creates a revenue stream that pays back the investors in Virtual Credits.",
    icon: "bi bi-shop",
  },

      {
        title: "Sunlight becomes electricity",
        desc:
          "Solar panels capture sunlight and convert it into electricity during the day. This process uses no fuel and produces no smoke or pollution.",
        icon: "bi bi-sun-fill",
      },
      {
        title: "Electricity is used by people and businesses",
        desc:
          "The electricity produced is used by nearby homes, schools, and factories - or sent to the national power grid to support daily needs.",
        icon: "bi bi-lightning-charge-fill",
      },
      {
        title: "Electricity has value",
        desc:
          "Just like water or mobile data, electricity has a price. Every unit produced and used creates income for the solar project.",
        icon: "bi bi-currency-dollar",
      },
      {
        title: "Solar projects earn income every day",
        desc:
          "As long as the sun shines and panels work: electricity is produced daily, income is generated regularly, operating costs stay low - and panels are designed to work for 20–30 years.",
        icon: "bi bi-calendar2-check",
      },
      {
        title: "Investors receive returns over time",
        desc:
          "Income from selling electricity is used to maintain the system, pay back project costs, and provide returns to investors over many years.",
        icon: "bi bi-piggy-bank-fill",
      },
    ],
    []
  );

  const whyStable = useMemo(
    () => [
      { icon: "bi bi-brightness-high-fill", text: "Sunlight is free and available every day" },
      { icon: "bi bi-gear-fill", text: "Solar systems have low maintenance needs" },
      { icon: "bi bi-clock-history", text: "Electricity is needed continuously by society" },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <section className="hiw">
        <div className="hiw-hero">
          <div className="hiw-heroOverlay" />
          <div className="hiw-heroInner">
            <div className="hiw-badge">
              <i className="bi bi-shield-check" aria-hidden="true" />
              Transparent & long-term
            </div>

            <div className="hiw-head">
              <h2 className="hiw-title">How Investment Works</h2>
              <p className="hiw-subtitle">
                A simple flow of how solar projects generate daily income and return value over time.
              </p>
            </div>

            <div className="hiw-stepsModern" aria-label="Investment steps">
              {steps.map((s, idx) => (
                <div key={s.no} className="hiw-stepCard">
                  <div className="hiw-stepTop">
                    <div className="hiw-stepNo">{s.no}</div>
                    <div className="hiw-stepIcon" aria-hidden="true">
                      <i className={s.icon} />
                    </div>
                  </div>

                  <div className="hiw-stepBody">
                    <div className="hiw-stepTitle">{s.title}</div>
                    <div className="hiw-stepSub">{s.sub}</div>
                  </div>

                  {idx < steps.length - 1 && <div className="hiw-stepConnector" aria-hidden="true" />}
                </div>
              ))}
            </div>

            <div className="hiw-ctaRow">
              <button type="button" className="hiw-ctaBtn" onClick={() => setOpen(true)}>
                Learn the details <span aria-hidden="true">→</span>
              </button>

              <div className="hiw-miniNote">
                <i className="bi bi-info-circle" aria-hidden="true" />
                <span>Press <b>Esc</b> to close</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div className="hiw-modal" role="dialog" aria-modal="true" aria-label="How Investment Works">
          <button
            type="button"
            className="hiw-modal-backdrop"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />

          <div className="hiw-modal-panel">
            <div className="hiw-modal-header">
              <div className="hiw-modal-headText">
                <h3 className="hiw-modal-title">Investment Explanation</h3>
                <p className="hiw-modal-desc">
                  Clean energy projects earn income from electricity production - and distribute value over time.
                </p>
              </div>

              <button type="button" className="hiw-modal-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="hiw-modal-body">
              <div className="hiw-modal-grid">
                <aside className="hiw-sideCard">
                  <div className="hiw-sideTitle">
                    <i className="bi bi-stars" aria-hidden="true" />
                    Why this is stable
                  </div>

                  <div className="hiw-sideList">
                    {whyStable.map((w) => (
                      <div key={w.text} className="hiw-sideItem">
                        <span className="hiw-sideIcon" aria-hidden="true">
                          <i className={w.icon} />
                        </span>
                        <span className="hiw-sideText">{w.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="hiw-sideFooter">
                    Long-term, low maintenance, and driven by daily demand.
                  </div>
                </aside>

                <div className="hiw-mainFlow">
                  {sections.map((sec, i) => (
                    <div key={sec.title} className="hiw-flowCard">
                      <div className="hiw-flowLeft">
                        <div className="hiw-flowIndex">{i + 1}</div>
                        <div className="hiw-flowIcon" aria-hidden="true">
                          <i className={sec.icon} />
                        </div>
                      </div>

                      <div className="hiw-flowContent">
                        <div className="hiw-flowTitle">{sec.title}</div>
                        <div className="hiw-flowDesc">{sec.desc}</div>
                      </div>
                    </div>
                  ))}

                  <div className="hiw-summary">
                    <b>Summary:</b> Solar turns free sunlight into electricity. Electricity has value, so projects earn
                    income daily. That income maintains the system, repays costs, and returns value to investors over time.
                  </div>
                </div>
              </div>
            </div>

            <div className="hiw-modal-footer">
              <button type="button" className="hiw-modal-ok" onClick={() => setOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}