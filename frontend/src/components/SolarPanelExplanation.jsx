import { Link } from "react-router-dom";
import "../styles/SolarPanelExplanation.css";

export default function SolarPanelExplanation() {
  return (
    <div className="spePage">
      {/* HERO */}
      <header className="speHero">
        <div className="speHeroOverlay" />
        <div className="speHeroInner">
          <div className="speTopRow">
            <div className="speKicker">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
              Solar Education
            </div>

            <Link to="/home" className="speBackLink">
              ← Back to Home
            </Link>
          </div>

          <h1 className="speTitle">Solar Panel Explanation</h1>
          <p className="speSubtitle">
            A simple visual guide showing how sunlight becomes electricity - and how it connects to school loads
            and the PLN grid in West Java.
          </p>

          <div className="speQuickNav" aria-label="Quick navigation">
            <a href="#step1-generation" className="spePill">
              1) Generation
            </a>
            <a href="#step2-inversion" className="spePill">
              2) Inversion (DC → AC)
            </a>
            <a href="#step3-consumption" className="spePill">
              3) Self-Consumption
            </a>
            <a href="#step4-pln-grid" className="spePill">
              4) PLN Grid
            </a>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="speContent">
        {/* IMAGE CARD */}
        <section className="speMediaCard">
          <div className="speMediaHeader">
            <div className="speMediaTitle">
              <i className="bi bi-diagram-3-fill" aria-hidden="true" />
              Visual Diagram
            </div>
            <div className="speMediaHint">
              <i className="bi bi-cursor-fill" aria-hidden="true" />
              Use the quick steps above to jump
            </div>
          </div>

          <img
            src="/SolarPanelExplanation.jpeg"
            alt="Solar panel explanation diagram"
            className="speMediaImg"
          />
        </section>

        {/* INTRO */}
        <section className="speIntro">
          <h2 className="speSectionTitle">How solar works</h2>
          <p className="speLead">
            Solar power is simpler than it looks. In many schools, the flow prioritizes{" "}
            <b>self-consumption</b> (use solar first) because exporting to the grid may not always reduce bills for every
            tariff.
          </p>
        </section>

        {/* STEPS */}
        <section className="speSteps">
          <article id="step1-generation" className="speStepCard">
            <div className="speStepTop">
              <div className="speStepBadge">
                <span className="speStepNo">1</span>
                Generation · The “Energy Source”
              </div>
              <div className="speStepIcon" aria-hidden="true">
                <i className="bi bi-brightness-high-fill" />
              </div>
            </div>

            <h3 className="speStepTitle">Sunlight hits the panels</h3>
            <p className="speStepText">
              The sun sends light energy every day. Solar panels capture that light and begin generating electrical
              power. This is clean energy - no fuel, no smoke, no noise.
            </p>
          </article>

          <article id="step2-inversion" className="speStepCard">
            <div className="speStepTop">
              <div className="speStepBadge">
                <span className="speStepNo">2</span>
                Inversion · The “Heart” of the system
              </div>
              <div className="speStepIcon" aria-hidden="true">
                <i className="bi bi-arrow-repeat" />
              </div>
            </div>

            <h3 className="speStepTitle">DC becomes usable AC electricity</h3>
            <p className="speStepText">
              Panels produce electricity as <b>DC</b>, while buildings use <b>AC</b>. The <b>inverter</b> converts DC
              into safe AC, so the school can actually use solar power.
            </p>
          </article>

          <article id="step3-consumption" className="speStepCard">
            <div className="speStepTop">
              <div className="speStepBadge">
                <span className="speStepNo">3</span>
                Self-Consumption · The “Benefit”
              </div>
              <div className="speStepIcon" aria-hidden="true">
                <i className="bi bi-building-check" />
              </div>
            </div>

            <h3 className="speStepTitle">The school uses solar first</h3>
            <p className="speStepText">
              The key rule: the school uses solar electricity <b>first</b>. This reduces how much power must be bought
              from PLN. In simple terms: more direct solar use = lower bill.
            </p>
          </article>

          <article id="step4-pln-grid" className="speStepCard">
            <div className="speStepTop">
              <div className="speStepBadge">
                <span className="speStepNo">4</span>
                PLN Grid · The “Safety Net”
              </div>
              <div className="speStepIcon" aria-hidden="true">
                <i className="bi bi-plug-fill" />
              </div>
            </div>

            <h3 className="speStepTitle">Grid export + PLN backup when solar is low</h3>
            <p className="speStepText">
              Solar output changes (clouds, rain, late afternoon). PLN acts as a safety net: when solar is not enough,
              PLN supplies power. When there’s extra solar, it may export to the grid depending on system rules.
              Reliability stays stable for the school.
            </p>
          </article>
        </section>

        {/* SUMMARY */}
        <section className="speSummary">
          <div className="speSummaryIcon" aria-hidden="true">
            <i className="bi bi-stars" />
          </div>
          <div>
            <h3 className="speSummaryTitle">Summary</h3>
            <p className="speSummaryText">
              Solar turns free sunlight into electricity. The inverter makes it usable, the school consumes it first
              (largest bill impact), and PLN ensures reliability as backup grid connection. That’s why solar is a smart
              and sustainable choice for schools in West Java.
            </p>
          </div>

          <Link to="/analysis" className="speCta">
            Explore Solutions <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}