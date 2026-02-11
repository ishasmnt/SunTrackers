import React, { useMemo, useState, useEffect, useRef, useId, useContext } from "react";
import { calculateSolar } from "../services/api";
import generateAdvisor from "../advisor/advisor";
import LanguageContext from "../context/LanguageContext";
import "../App.css";
import "../styles/Planner.css";

const DISTRICT_CONFIG = { // https://landscape.id/pages/landscape-solar said that in Indonesia, avg peak sun 4-5 hours, there's no website/journal showing per-district psh, so just use rough estimates
  Bandung: { psh: 4.5, capexPerKwp: 16500000 }, // https://share.google/qDeYObK5xSMtYIjhF , use avg price
  Bekasi: { psh: 4.8, capexPerKwp: 20000000 }, // https://www.rumah123.com/panduan-properti/tips-properti-101590-solar-panel-rumah-id.html
  Bogor: { psh: 4.6, capexPerKwp: 17500000 },
  Cirebon: { psh: 4.9, capexPerKwp: 17500000 },
};

const TARIFF_BY_TYPE = { School: 900, Household: 1444.70, MSME: 1444.70 }; //https://web.pln.co.id/media/2025/12/tarif-listrik , tariff for school 900 from csv
const SHADING_FACTOR = { None: 1.0, Medium: 0.85, Heavy: 0.7 };
const ROOF_MAX_KWP = { Small: 1, Medium: 3, Large: 10 }; //6-10m2, 18-30, 60-100
const TARGET_OFFSET = { School: 0.3, Household: 0.4, MSME: 0.5 };

const PR = 0.75; //best Performance Ratio assumption betwewn 0.75-0.85, so just  take the lower bound
const PANEL_W = 350; // https://share.google/O8iQSUCcPgIADHSFH
//260W: Harga berkisar antara Rp3.900.000 - Rp6.300.000
//300W: Harga berkisar antara Rp4.500.000 - Rp7.500.000
//350W: Harga berkisar antara Rp5.250.000 - Rp8.750.000
//400W: Harga berkisar antara Rp6.000.000 - Rp10.000.000

const CO2_KG_PER_KWH = 0.85; // https://share.google/hyPUrBbFnh8FKtgxg
const COMMUNITY_NET_RATE = 0.7; // user gets 70% of savings after green fee

const GRANT_RANGE_BY_TYPE = {
  School: { min: 0, max: 70 },
  MSME: { min: 0, max: 50 },
  Household: { min: 0, max: 0 }, // disabled
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatIDR(n) {
  if (!Number.isFinite(n)) return "-";
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function formatNum(n, digits = 1) {
  if (!Number.isFinite(n)) return "-";
  return Number(n).toFixed(digits);
}

function HelpTip({ text }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="helpTipWrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="helpTipBtn"
        aria-label="Help"
        aria-describedby={open ? tipId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <i className="bi bi-question-circle"></i>
      </button>

      {open && (
        <span id={tipId} role="tooltip" className="helpTipBubble">
          {text}
        </span>
      )}
    </span>
  );
}

function UiSelect({ label, helpText, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="uiSelect">
      {label && (
        <label className="plannerLabel">
          <strong className="labelWithHelp">
            {label}
            {helpText ? <HelpTip text={helpText} /> : null}
          </strong>
        </label>
      )}

      <button
        type="button"
        className="uiSelectBtn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="uiSelectVal">
          {options.find((o) => o.value === value)?.label ?? value}
        </span>
        <i className="bi bi-chevron-down"></i>
      </button>

      {open && (
        <>
          <div className="uiSelectBackdrop" onClick={() => setOpen(false)} />
          <div className="uiSelectMenu" role="listbox">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`uiSelectItem ${opt.value === value ? "isActive" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function calcLocal(inputs) {
  const districtCfg = DISTRICT_CONFIG[inputs.district] || DISTRICT_CONFIG.Bandung;
  const userType = inputs.userType || "School"; //School

  const tariff = TARIFF_BY_TYPE[userType] ?? TARIFF_BY_TYPE.School; //900 IDR/kWh for school
  const shadingFactor = SHADING_FACTOR[inputs.shading] ?? 1.0; //None --> 1.0
  const roofMax = ROOF_MAX_KWP[inputs.roofSize] ?? 3; //large --> 10 kWp
  const targetOffset = TARGET_OFFSET[userType] ?? 0.3; //School --> 0.3 , means only expect 30% electricity covered by solar

  const billIdr = Number(inputs.bill); //monthly bill in IDR (user input)
  const monthlyKwh = billIdr / tariff; // 900000/900 = 1000 kWh

  const kwhPerKwpPerMonth = districtCfg.psh * (365/12) * PR * shadingFactor; // Bandung --> 4.5 * 365/12 * 0.75 * 1 = 102.65625 kWh/kWp/month
  const desiredMonthlyOffsetKwh = monthlyKwh * targetOffset; // 1000 * 0.3 = 300 kWh/month

  let recommendedKwp = desiredMonthlyOffsetKwh / kwhPerKwpPerMonth; // 300 / 102.65625 = 2.9223744292 kWp
  if (!Number.isFinite(recommendedKwp) || recommendedKwp <= 0) recommendedKwp = 0.1; // rounding

  const systemKwp = clamp(recommendedKwp, 0.1, roofMax); //look for highest from recKwp and 0.1, then limit to roofMax --> 2.92 kWp
  const panels = Math.max(1, Math.ceil((systemKwp * 1000) / PANEL_W)); // 2.92*1000/350=8.34 --> 9 panels

  const annualKwh = systemKwp * districtCfg.psh * 365 * PR * shadingFactor; // 2.92 * 4.5 * 365 * 0.75 = 3,599.99 kWh/year
  const monthlySavings = (annualKwh / 12) * tariff; // (3599.99/12)*900 = 270000 IDR/month

  const grantRange = GRANT_RANGE_BY_TYPE[userType] || { min: 0, max: 0 };
  const grantPct = clamp(
    Number(inputs.grantPct ?? 0),
    grantRange.min,
    grantRange.max
  );
  const baseCapex = systemKwp * districtCfg.capexPerKwp; // 2.9223744292 * 16,500,000 = 48,219,178.0818 IDR
  const capexAfterGrant = baseCapex * (1 - grantPct / 100); // after grant , e.g. 0% --> 48,219,178.0818 IDR

  const annualSavings = monthlySavings * 12; // 270000 * 12 = 3,240,000 IDR/year
  const paybackYears = annualSavings > 0 ? capexAfterGrant / annualSavings : Number.POSITIVE_INFINITY; // 48,219,178.0818 / 3,240,000 = 14.88 years

  const billReductionPct = clamp((monthlySavings / billIdr) * 100, 0, 100); // 270000 / 900,000 * 100 = 30.8 %
  const co2KgYear = annualKwh * CO2_KG_PER_KWH; // 3,599.99 * 0.85 = 3,141.6 kg CO2/year

  const financing = userType === "Household" ? "Direct" : inputs.financing;
  const isCommunity = financing === "Community";
  const greenFee = isCommunity ? monthlySavings * (1 - COMMUNITY_NET_RATE) : 0;
  const netSavingsSchool = isCommunity ? monthlySavings * COMMUNITY_NET_RATE : monthlySavings;

  return {
    system_size: Number(systemKwp.toFixed(1)),
    cost: Math.round(capexAfterGrant),
    savings: Math.round(monthlySavings),
    annual_kwh: Math.round(annualKwh),
    panels,
    tariff,
    psh: districtCfg.psh,
    shadingFactor,
    pr: PR,
    bill_reduction_pct: Number(billReductionPct.toFixed(0)),
    co2_kg_year: Math.round(co2KgYear),
    payback_years: Number.isFinite(paybackYears) ? Number(paybackYears.toFixed(1)) : null,
    financing: inputs.financing,
    upfront_cost_school: isCommunity ? 0 : Math.round(capexAfterGrant),
    green_fee: Math.round(greenFee),
    net_savings_school: Math.round(netSavingsSchool),
    grantPct,
    financing,
  };
}

function makeAdvice(inputs, computed) {
  const isCommunity = inputs.financing === "Community";
  if (isCommunity) {
    return `With community funding, your upfront cost is Rp 0. Estimated net savings after a green fee is ${formatIDR(
      computed.net_savings_school
    )}/month.`;
  }

  const pb = computed.payback_years;
  if (!pb) return `This estimate depends on site conditions. Check shading and roof suitability.`;
  if (pb <= 4) return `Strong economics: estimated payback is about ${pb} years for ${inputs.district}.`;
  if (pb <= 7) return `Solid option: estimated payback is about ${pb} years. Grants can shorten it further.`;
  return `Payback is about ${pb} years. Consider grants or reducing shading to improve returns.`;
}

function getLeftNote({ result, formData, localPreview }) {
  if (result?.advice) return result.advice;

  if (localPreview) {
    return makeAdvice(formData, { ...localPreview, financing: formData.financing });
  }

  return "Run a calculation to get a personalized note based on your site and financing options.";
}

export default function Planner() {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    bill: "",
    district: "Bandung",
    userType: "School",
    roofSize: "Medium",
    shading: "None",
    financing: "Direct",
    grantPct: 0,
  });

  useEffect(() => {
    const range = GRANT_RANGE_BY_TYPE[formData.userType] || { min: 0, max: 0 };

    setFormData((prev) => {
      const clampedGrant = clamp(prev.grantPct, range.min, range.max);

      // prevent unnecessary re-render
      if (clampedGrant === prev.grantPct) return prev;

      return {
        ...prev,
        grantPct: clampedGrant,
      };
    });
  }, [formData.userType]);

  
  useEffect(() => {
    if (formData.userType === "Household" && formData.financing === "Community") {
      setFormData((f) => ({ ...f, financing: "Direct" }));
    }
  }, [formData.userType]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [uiAlert, setUiAlert] = useState({ open: false, title: "", message: "" });

  const openAlert = (title, message) => setUiAlert({ open: true, title, message });
  const closeAlert = () => setUiAlert((s) => ({ ...s, open: false }));

  const localPreview = useMemo(() => {
    const billNum = Number(formData.bill);
    if (!Number.isFinite(billNum) || billNum <= 0) return null;
    return calcLocal({ ...formData, bill: billNum });
  }, [formData]);

  const handleSubmit = async () => {
    if (!formData.bill) {
      openAlert("Missing input", "Please enter your monthly electricity bill (IDR) to calculate savings.");
      return;
    }

    const billNum = Number(formData.bill);
    if (!Number.isFinite(billNum) || billNum <= 0) {
      openAlert("Invalid amount", "Please enter a valid monthly bill amount greater than 0.");
      return;
    }
    
    setLoading(true);
    try {
      const apiData = await calculateSolar({ ...formData, bill: billNum });
      const computed = calcLocal({ ...formData, bill: billNum });

      const merged = {
        ...computed,
        ...apiData,
        system_size: apiData?.system_size ?? computed.system_size,
        cost: apiData?.cost ?? computed.cost,
        savings: apiData?.savings ?? computed.savings,
      };

      const advice = apiData?.advice ?? makeAdvice(formData, merged);

      let explanation = null;
      try {
        explanation = generateAdvisor(formData, { ...merged, advice });
      } catch {
        explanation = null;
      }

      setResult({ ...merged, advice, explanation });
    } catch (error) {
      console.error("Calculation failed", error);

      const computed = calcLocal({ ...formData, bill: billNum });
      const advice = makeAdvice(formData, computed);

      let explanation = null;
      try {
        explanation = generateAdvisor(formData, { ...computed, advice });
      } catch {
        explanation = null;
      }

      setResult({ ...computed, advice, explanation });
    }
    setLoading(false);
  };

  const isCommunity = formData.financing === "Community";
  const displayCost = result ? (isCommunity ? result.upfront_cost_school : result.cost) : 0;
  const displaySavings = result ? (isCommunity ? result.net_savings_school : result.savings) : 0;
  const leftNoteText = getLeftNote({ result, formData, localPreview });

  return (
    <div className="plannerShell">
      <div className="plannerTwoCol">
        <aside className="plannerLeft">
          <div className="leftHeader">
            <h1 className="leftTitle">
              <i className="bi bi-sun-fill"></i> {t?.solarCalculator || "Solar Calculator"}
            </h1>
            <p className="leftSubtitle">{t?.calcSubtitle || "Estimate solar savings, payback, and community-funded options."}</p>
          </div>

          <div className="plannerIntroNote">
            <i className="bi bi-info-circle"></i>
            <p>
              {t?.calcIntro || "This calculator uses a capacity range of"} <strong>1-10 kWp</strong> {t?.calcIntro2 || "to represent a typical initial installation in a small to medium-sized school, with a target energy offset of approximately"} <strong>20-30%</strong>, {t?.calcIntro3 || "in line with the common practice of phased installations before large-scale system expansion."}
            </p>
          </div>

          <div className="plannerCard plannerFormCard">
            <label className="plannerLabel">
              <strong>{t?.monthlyBill || "Monthly Electricity Bill (IDR)"}</strong>
            </label>
            <input
              className="plannerInput"
              type="number"
              placeholder={t?.billPlaceholder || "e.g. 2000000"}
              value={formData.bill}
              onChange={(e) => setFormData({ ...formData, bill: e.target.value })}
            />

            <div className="plannerFormGrid">
              <div>
                <UiSelect
                  label={t?.districtLabel || "District / Location"}
                  helpText={t?.districtHelp || "Used to estimate local sun hours and typical installed cost for your area."}
                  value={formData.district}
                  onChange={(v) => setFormData({ ...formData, district: v })}
                  options={[
                    { value: "Bandung", label: "Bandung" },
                    { value: "Bekasi", label: "Bekasi" },
                    { value: "Bogor", label: "Bogor" },
                    { value: "Cirebon", label: "Cirebon" },
                  ]}
                />
              </div>

              <div>
                <UiSelect
                  label={t?.userTypeLabel || "User Type"}
                  helpText={t?.userTypeHelp || "Affects the electricity tariff and the target offset used to size the solar system."}
                  value={formData.userType}
                  onChange={(v) => setFormData({ ...formData, userType: v })}
                  options={[
                    { value: "School", label: "School" },
                    { value: "Household", label: "Household" },
                    { value: "MSME", label: "MSME" },
                  ]}
                />
              </div>

              <div>
                <UiSelect
                  label={t?.roofSizeLabel || "Roof Size"}
                  helpText={t?.roofSizeHelp || "A simple proxy for available roof area. It limits the maximum system size we can recommend."}
                  value={formData.roofSize}
                  onChange={(v) => setFormData({ ...formData, roofSize: v })}
                  options={[
                    { value: "Small", label: "Small" },
                    { value: "Medium", label: "Medium" },
                    { value: "Large", label: "Large" },
                  ]}
                />
              </div>

              <div>
                <UiSelect
                  label={t?.shadingLabel || "Shading"}
                  helpText={t?.shadingHelp || "Shading reduces solar output. Choose Medium/Heavy if trees or buildings shade the roof during peak hours."}
                  value={formData.shading}
                  onChange={(v) => setFormData({ ...formData, shading: v })}
                  options={[
                    { value: "None", label: "None" },
                    { value: "Medium", label: "Medium" },
                    { value: "Heavy", label: "Heavy" },
                  ]}
                />
              </div>

              <div>
                <UiSelect
                  label={t?.financingLabel || "Financing"}
                  helpText={
                    formData.userType === "Household"
                      ? t?.financingHelpHH || "Community financing is currently available only for schools and MSMEs."
                      : t?.financingHelp || "Direct means you pay upfront and keep the savings. Community means Rp 0 upfront, but savings are shared via a green fee."
                  }
                  value={formData.financing}
                  onChange={(v) => setFormData({ ...formData, financing: v })}
                  options={
                    formData.userType === "Household"
                      ? [{ value: "Direct", label: "Direct" }]
                      : [
                          { value: "Direct", label: "Direct" },
                          { value: "Community", label: "Community" },
                        ]
                  }
                />
              </div>

              <div>
                <label className="plannerLabel">
                  <strong className="labelWithHelp">
                    {t?.grantCoverage || "Grant Coverage"} <HelpTip text={t?.grantHelp || "The percentage of upfront cost covered by grants or subsidies. Higher coverage lowers payback time."} />
                  </strong>
                  <span className="plannerHint">
                    {formData.userType === "Household"
                      ? t?.notAvailable || "Not available"
                      : `${formData.grantPct}%`}
                  </span>
                </label>
                {(() => {
                  const range = GRANT_RANGE_BY_TYPE[formData.userType] || { min: 0, max: 0 };
                  const disabled = formData.userType === "Household";

                  return (
                    <input
                      className="plannerRange"
                      type="range"
                      min={range.min}
                      max={range.max}
                      value={clamp(formData.grantPct, range.min, range.max)}
                      disabled={disabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          grantPct: Number(e.target.value),
                        })
                      }
                    />
                  );
                })()}
              </div>
            </div>

            <button className="plannerBtn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Calculating..." : "Calculate Savings"}
            </button>

            {localPreview && (
              <div className="plannerMiniPreview">
                <div className="plannerMiniRow">
                  <span>Quick preview</span>
                  <span>
                    {formatNum(localPreview.system_size, 1)} kWp ~{localPreview.panels} panels
                  </span>
                </div>
                <div className="plannerMiniRow">
                  <span>Est. savings</span>
                  <span>{formatIDR(localPreview.savings)}/month</span>
                </div>
              </div>
            )}
            <div className="plannerCard leftNoteCard">
              <div className="noteHead">
                <i className="bi bi-robot"></i>
                <div className="noteTitle">AI Consultant's Note</div>
              </div>
              <div className="noteBody">“{leftNoteText}”</div>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <main className="plannerRight">
          <div className="rightHeader">
            <h2 className="rightTitle">
              <i className="bi bi-calculator"></i> Analysis Result
            </h2>
          </div>

          {!result ? (
            <div className="plannerCard emptyState">
              <div className="emptyIcon">
                <i className="bi bi-arrow-left-circle"></i>
              </div>
              <div className="emptyTitle">Fill the inputs, then calculate.</div>
              <div className="emptyText">
                You'll see system size, estimated cost, payback, bill reduction, CO₂ impact, and the full breakdown here.
              </div>
              <div className="emptyTips">
                <div className="tipRow">
                  <i className="bi bi-lightning-charge"></i>
                  <span>Try changing shading and roof size to see the difference.</span>
                </div>
                <div className="tipRow">
                  <i className="bi bi-people"></i>
                  <span>Select “Community Funded” to simulate Rp 0 upfront cost.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rightStack">
              <div className="plannerMetricsGrid">
                <div className="metricCard">
                  <div className="metricIcon">
                    <i className="bi bi-tools"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>System Size</span>
                    <HelpTip text="Recommended solar capacity (kWp). Higher values usually mean more energy production and higher upfront cost." />
                  </div>

                  <div className="metricValue">{formatNum(result.system_size, 1)} kWp</div>
                  <div className="metricSub">~{result.panels} panels</div>
                </div>

                <div className="metricCard metricCost">
                  <div className="metricIcon">
                    <i className="bi bi-cash"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>{isCommunity ? "Upfront Cost" : "Estimated Cost"}</span>
                    <HelpTip text="Estimated installation cost for the recommended system size. Grants will reduce this amount. " />
                  </div>

                  <div className="metricValue">{formatIDR(displayCost)}</div>
                  <div className="metricSub">
                    {isCommunity ? "covered by community" : result.grantPct ? `after ${result.grantPct}% grant` : "est. capex"}
                  </div>
                </div>

                <div className="metricCard metricSave">
                  <div className="metricIcon">
                    <i className="bi bi-piggy-bank"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>Monthly Savings</span>
                    <HelpTip text="Estimated value of the bill reduction per month. Under Community funding, this is the net amount after the green fee." />
                  </div>

                  <div className="metricValue">{formatIDR(displaySavings)}</div>
                  <div className="metricSub">{isCommunity ? "net to school" : "bill reduction value"}</div>
                </div>

                <div className="metricCard">
                  <div className="metricIcon">
                    <i className="bi bi-hourglass"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>Payback</span>
                    <HelpTip text="Simple payback = upfront cost / yearly savings. It ignores inflation, export credits, maintenance, and financing costs." />
                  </div>

                  <div className="metricValue">
                    {isCommunity ? "0 years" : result.payback_years ? `${result.payback_years} years` : "N/A"}
                  </div>
                  <div className="metricSub">{isCommunity ? "no upfront spend" : "simple estimate"}</div>
                </div>

                <div className="metricCard">
                  <div className="metricIcon">
                    <i className="bi bi-graph-down"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>Bill Reduction</span>
                    <HelpTip text="Estimated percentage of your current bill offset by solar production. Actual results depend on usage patterns and system performance." />
                  </div>

                  <div className="metricValue">
                    {Number.isFinite(result.bill_reduction_pct) ? `${result.bill_reduction_pct}%` : "-"}
                  </div>
                  <div className="metricSub">based on tariff estimate</div>
                </div>

                <div className="metricCard">
                  <div className="metricIcon">
                    <i className="bi bi-globe-americas"></i>
                  </div>

                  <div className="metricLabel labelWithHelp">
                    <span>CO₂ Reduced</span>
                    <HelpTip text="Estimated annual emissions avoided based on your solar energy production. Uses an emissions factor per kWh (grid average assumption)." />
                  </div>

                  <div className="metricValue">
                    {Number.isFinite(result.co2_kg_year) ? `${Math.round(result.co2_kg_year / 1000)} t/yr` : "-"}
                  </div>
                  <div className="metricSub">
                    {Number.isFinite(result.annual_kwh) ? `${result.annual_kwh.toLocaleString("id-ID")} kWh/yr` : ""}
                  </div>
                </div>
              </div>

              {result.explanation && (
                <div className="plannerCard breakdownCard">
                  <h3 className="breakdownTitle">How we estimated this</h3>
                  {result.explanation.rationale && <p className="breakdownText">{result.explanation.rationale}</p>}

                  <div className="breakdownGrid">
                    <div className="breakdownBox">
                      <div className="breakdownBoxTitle">Panels</div>
                      <div className="breakdownBoxValue">{result.explanation.panels ?? result.panels} pcs</div>
                      {result.explanation.summary && <div className="breakdownBoxSub">{result.explanation.summary}</div>}
                    </div>

                    <div className="breakdownBox">
                      <div className="breakdownBoxTitle">Assumptions</div>
                      <ul className="breakdownList">
                        {Array.isArray(result.explanation.assumptions) &&
                          result.explanation.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="breakdownSection">
                    <div className="breakdownSectionTitle">Next steps</div>
                    <ol className="breakdownList">
                      {Array.isArray(result.explanation.checklist) &&
                        result.explanation.checklist.map((c, i) => <li key={i}>{c}</li>)}
                    </ol>
                  </div>

                  <div className="breakdownSection">
                    <div className="breakdownSectionTitle">Placement & optimizations</div>
                    {result.explanation.placement?.note && <p className="breakdownText">{result.explanation.placement.note}</p>}
                    <ol className="breakdownList">
                      {Array.isArray(result.explanation.optimizations) &&
                        result.explanation.optimizations.map((o, i) => <li key={i}>{o}</li>)}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {uiAlert.open && (
        <div className="uiModalOverlay" onClick={closeAlert} role="presentation">
          <div className="uiModal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="uiModalHead">
              <div className="uiModalIcon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div className="uiModalTitleWrap">
                <div className="uiModalTitle">{uiAlert.title}</div>
                <div className="uiModalMsg">{uiAlert.message}</div>
              </div>
            </div>

            <div className="uiModalActions">
              <button className="uiModalBtn" onClick={closeAlert}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}