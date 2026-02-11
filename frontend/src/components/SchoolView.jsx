import React, { useEffect, useMemo, useState } from "react";
import "../styles/SchoolView.css";
import SchoolReal from "../components/SchoolReal.jsx";

function parseCSV(csvText) {
  const lines = csvText.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return [];

  const splitLine = (line) => {
    const out = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = splitLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function toNumber(v) {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function monthLabel(yyyyMm) {
  const [, m] = String(yyyyMm).split("-");
  const mm = Number(m);
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return names[mm - 1] || String(yyyyMm);
}

function getMaxYearFromLogs(logArr) {
  let maxY = 0;
  for (const l of logArr) {
    const m = String(l.month || "");
    const y = Number(m.slice(0, 4));
    if (Number.isFinite(y)) maxY = Math.max(maxY, y);
  }
  return maxY || new Date().getFullYear();
}

function buildYearMonths(year) {
  const out = [];
  for (let mm = 1; mm <= 12; mm++) out.push(`${year}-${String(mm).padStart(2, "0")}`);
  return out;
}

function formatAxisCompact(n) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function formatNumber(n, maxFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: maxFractionDigits }).format(n);
}

function formatIDR(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function sortCompare(a, b, key, dir) {
  const va = a[key];
  const vb = b[key];
  let res = 0;

  if (typeof va === "string" || typeof vb === "string") {
    res = String(va).localeCompare(String(vb));
  } else {
    res = (va ?? 0) - (vb ?? 0);
  }

  return dir === "asc" ? res : -res;
}

function AreaChart({
  title,
  series,
  valueKey,
  yTitle = "",
  height = 220,
  formatTooltipValue,
  formatAxisValue,
  compareSeries,
  compareValueKey,
}) {
  const [tip, setTip] = useState(null);

  const width = 560;
  const padL = 60;
  const padR = 18;
  const padT = 18;
  const padB = 72;

  const values = series.map((d) => toNumber(d[valueKey]));
  const compareValues = compareSeries?.length
    ? compareSeries.map((d) => toNumber(d[compareValueKey]))
    : [];

  const allValues = values.concat(compareValues);
  const minRaw = Math.min(...allValues);
  const maxRaw = Math.max(...allValues);

  const rawRange = Math.max(1, maxRaw - minRaw);
  const padV = Math.max(rawRange * 0.25, Math.max(5, Math.abs(maxRaw) * 0.06));
  const minAxis = minRaw - padV;
  const maxAxis = maxRaw + padV;
  const axisRange = Math.max(1, maxAxis - minAxis);

  const xStep = series.length > 1 ? (width - padL - padR) / (series.length - 1) : 0;

  const yFor = (v) => {
    const t = (v - minAxis) / axisRange;
    return padT + (1 - t) * (height - padT - padB);
  };

  const points = series.map((d, i) => {
    const x = padL + i * xStep;
    const v = toNumber(d[valueKey]);
    return { x, y: yFor(v), v, m: d.month };
  });

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const baselineY = yFor(minAxis);
  const areaD =
    `${lineD} ` +
    `L ${(points[points.length - 1]?.x ?? padL).toFixed(2)} ${baselineY.toFixed(2)} ` +
    `L ${(points[0]?.x ?? padL).toFixed(2)} ${baselineY.toFixed(2)} Z`;

  const ticks = [
    { v: minAxis },
    { v: (minAxis + maxAxis) / 2 },
    { v: maxAxis },
  ];

  const comparePoints =
    compareSeries?.length && compareSeries.length === series.length
      ? compareSeries.map((d, i) => {
          const x = padL + i * xStep;
          const v = toNumber(d[compareValueKey]);
          return { x, y: yFor(v), v, m: d.month };
        })
      : null;

  const compareLineD = comparePoints
    ? comparePoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ")
    : null;

  return (
    <div className="svCard">
      <div className="svCardHead">
        <div className="svCardTitle">{title}</div>
        {comparePoints ? <div className="svCardHint">Includes comparison</div> : null}
      </div>

      <div className="svChartWrap">
        <svg className="svChart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
          {yTitle ? (
            <text
              x="18"
              y={height / 2}
              className="svAxisText"
              textAnchor="middle"
              transform={`rotate(-90 18 ${height / 2})`}
            >
              {yTitle}
            </text>
          ) : null}

          {ticks.map((t, idx) => {
            const y = yFor(t.v);
            const label = formatAxisValue ? formatAxisValue(t.v) : formatAxisCompact(t.v);
            return (
              <g key={`tick-${idx}`}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} className="svGridLine" />
                <text x={padL - 10} y={y + 4} className="svAxisText" textAnchor="end">
                  {label}
                </text>
              </g>
            );
          })}

          <path d={areaD} className="svArea" />
          <path d={lineD} className="svLine" />

          {compareLineD ? <path d={compareLineD} className="svLineCompare" /> : null}

          {points.map((p, idx) => (
            <circle
              key={`${p.m}-${idx}`}
              cx={p.x}
              cy={p.y}
              r="3.2"
              className="svDot"
              onMouseEnter={() => setTip({ x: p.x, y: p.y, m: p.m, v: p.v })}
              onMouseLeave={() => setTip(null)}
            />
          ))}

          {tip && (
            <g transform={`translate(${Math.min(width - 220, tip.x + 10)}, ${Math.max(44, tip.y - 20)})`}>
              <rect x="0" y="-28" rx="10" ry="10" width="210" height="54" fill="#fff" stroke="rgba(0,0,0,0.14)" />
              <text x="12" y="-8" className="svAxisText">
                {monthLabel(tip.m)}
              </text>
              <text x="12" y="14" className="svAxisText">
                {formatTooltipValue ? formatTooltipValue(tip.v) : formatNumber(tip.v)}{" "}
              </text>
            </g>
          )}

          {series.map((d, i) => {
            const x = padL + i * xStep;
            const y = height - 45;
            return (
              <text
                key={`${d.month}-${i}`}
                x={x}
                y={y}
                className="svAxisText svAxisTextX"
                textAnchor="end"
                transform={`rotate(-35 ${x} ${y})`}
              >
                {monthLabel(d.month)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const GRID_EMISSION_KG_PER_KWH = 0.85;

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function pctChange(current, prev) {
  if (!Number.isFinite(prev) || prev === 0) return null;
  return (current - prev) / prev;
}

function buildTasksFromInsights(insights) {
  const tasks = [];

  tasks.push({
    id: "lights",
    label: "Do a quick 'lights-off' check in empty rooms after class.",
  });

  tasks.push({
    id: "ac",
    label: "Keep AC at 24-26°C and close doors/windows while it's on.",
  });

  if (insights.generationDrop) {
    tasks.push({
      id: "clean",
      label: "Check panel cleanliness (dust/leaves) and report if cleaning is needed.",
    });
  }

  if (insights.gridRise) {
    tasks.push({
      id: "shift",
      label: "Shift high-power activities to midday when solar production is higher.",
    });
  }

  if (insights.gridShareHigh) {
    tasks.push({
      id: "audit",
      label: "Run an 'Energy Patrol': identify devices left on unnecessarily.",
    });
  }

  tasks.push({
    id: "chargers",
    label: "Unplug chargers and unused devices to reduce standby power.",
  });

  return tasks.slice(0, 6);
}

function safeLocalStorageKey(scopeKey) {
  return `pwjava_school_tasks_${scopeKey}`;
}

export default function SchoolView() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [schools, setSchools] = useState([]);
  const [logs, setLogs] = useState([]);

  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  const [sortKey, setSortKey] = useState("sum_saving");
  const [sortDir, setSortDir] = useState("asc");

  const [dataMode, setDataMode] = useState("synthetic"); // real | synthetic

  const [displayMode, setDisplayMode] = useState("money"); // energy | co2 | money
  const [compareMode, setCompareMode] = useState("none"); // none | prevYear

  const [taskDone, setTaskDone] = useState({});

  const [leftTab, setLeftTab] = useState("details"); // details | tasks
  const [leftView, setLeftView] = useState("details"); // details | table

  useEffect(() => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const [schoolsRes, logsRes] = await Promise.all([
          fetch(`${base}data/schools.csv`),
          fetch(`${base}data/school_energy_log.csv`),
        ]);

        if (!schoolsRes.ok) throw new Error(`Failed to load schools.csv (${schoolsRes.status})`);
        if (!logsRes.ok) throw new Error(`Failed to load school_energy_log.csv (${logsRes.status})`);

        const schoolsText = await schoolsRes.text();
        const logsText = await logsRes.text();

        const schoolsRows = parseCSV(schoolsText);
        const logsRows = parseCSV(logsText);

        const schoolsNorm = schoolsRows.map((r) => ({
          ...r,
          school_id: String(r.school_id ?? "").trim(),
          school_name: String(r.school_name ?? "").trim(),
          city: String(r.city ?? "").trim(),
          district: String(r.district ?? "").trim(),
          address: String(r.address ?? "").trim(),
          installation_date: String(r.installation_date ?? "").trim(),
          latitude: toNumber(r.latitude),
          longitude: toNumber(r.longitude),
          installation_cost: toNumber(r.installation_cost),
          panel_capacity_kw: toNumber(r.panel_capacity_kw),
        }));

        const logsNorm = logsRows.map((r) => ({
          ...r,
          school_id: String(r.school_id ?? "").trim(),
          month: String(r.month ?? "").trim(),
          energy_generated_kwh: toNumber(r.energy_generated_kwh),
          energy_used_kwh: toNumber(r.energy_used_kwh),
          grid_energy_kwh: toNumber(r.grid_energy_kwh),
          cost_saving_idr: toNumber(r.cost_saving_idr),
        }));

        setSchools(schoolsNorm);
        setLogs(logsNorm);
        setSelectedSchoolId(null);
      } catch (e) {
        setErr(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const schoolsById = useMemo(() => {
    const m = new Map();
    for (const s of schools) m.set(s.school_id, s);
    return m;
  }, [schools]);

  const selectedSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schoolsById.get(selectedSchoolId) || null;
  }, [selectedSchoolId, schoolsById]);

  const scopeLogs = useMemo(() => {
    if (!selectedSchoolId) return logs;
    return logs.filter((l) => l.school_id === selectedSchoolId);
  }, [logs, selectedSchoolId]);

  const maxYear = useMemo(() => getMaxYearFromLogs(scopeLogs), [scopeLogs]);

  const monthsInScope = useMemo(() => buildYearMonths(maxYear), [maxYear]);

  const prevYearMonths = useMemo(() => buildYearMonths(maxYear - 1), [maxYear]);

  const scopeLogsPrevYear = useMemo(() => {
    if (compareMode !== "prevYear") return [];
    const prevYear = String(maxYear - 1);
    if (!selectedSchoolId) {
      return logs.filter((l) => String(l.month).startsWith(prevYear));
    }
    return logs.filter((l) => l.school_id === selectedSchoolId && String(l.month).startsWith(prevYear));
  }, [compareMode, logs, selectedSchoolId, maxYear]);

  const kpisBase = useMemo(() => {
    let totalGen = 0;
    let totalUse = 0;
    let totalGrid = 0;
    let totalSave = 0;

    for (const l of scopeLogs) {
      totalGen += l.energy_generated_kwh;
      totalUse += l.energy_used_kwh;
      totalGrid += l.grid_energy_kwh;
      totalSave += l.cost_saving_idr;
    }

    return {
      totalGenKwh: totalGen,
      totalUseKwh: totalUse,
      totalGridKwh: totalGrid,
      totalSaveIdr: totalSave,
      totalSchools: schools.length,
    };
  }, [scopeLogs, schools.length]);

  const globalTotals = useMemo(() => {
    let totalGen = 0;
    let totalUse = 0;
    let totalSave = 0;
    for (const l of logs) {
      totalGen += l.energy_generated_kwh;
      totalUse += l.energy_used_kwh;
      totalSave += l.cost_saving_idr;
    }
    return { totalGen, totalUse, totalSave };
  }, [logs]);

  const seriesByMonthBase = useMemo(() => {
    const byMonth = new Map();

    for (const m of monthsInScope) {
      byMonth.set(m, {
        month: m,
        energy_generated_kwh: 0,
        energy_used_kwh: 0,
        grid_energy_kwh: 0,
        cost_saving_idr: 0,
      });
    }

    for (const l of scopeLogs) {
      if (!byMonth.has(l.month)) continue;
      const row = byMonth.get(l.month);
      row.energy_generated_kwh += l.energy_generated_kwh;
      row.energy_used_kwh += l.energy_used_kwh;
      row.grid_energy_kwh += l.grid_energy_kwh;
      row.cost_saving_idr += l.cost_saving_idr;
    }

    return Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [scopeLogs, monthsInScope]);

  const seriesByMonthPrev = useMemo(() => {
    if (compareMode !== "prevYear") return null;

    const byMonth = new Map();
    for (const m of prevYearMonths) {
      byMonth.set(m, {
        month: m,
        energy_generated_kwh: 0,
        energy_used_kwh: 0,
        grid_energy_kwh: 0,
        cost_saving_idr: 0,
      });
    }

    for (const l of scopeLogsPrevYear) {
      if (!byMonth.has(l.month)) continue;
      const row = byMonth.get(l.month);
      row.energy_generated_kwh += l.energy_generated_kwh;
      row.energy_used_kwh += l.energy_used_kwh;
      row.grid_energy_kwh += l.grid_energy_kwh;
      row.cost_saving_idr += l.cost_saving_idr;
    }

    const arr = Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
    if (arr.length !== seriesByMonthBase.length) return null;
    return arr;
  }, [compareMode, prevYearMonths, scopeLogsPrevYear, seriesByMonthBase.length]);

  const seriesByMonth = useMemo(() => {
    let cum = 0;
    return seriesByMonthBase.map((r) => {
      const genMwh = r.energy_generated_kwh / 1000;
      const gridMwh = r.grid_energy_kwh / 1000;
      const genCo2Kg = r.energy_generated_kwh * GRID_EMISSION_KG_PER_KWH;
      const gridCo2Kg = r.grid_energy_kwh * GRID_EMISSION_KG_PER_KWH;
      cum += r.cost_saving_idr;

      return {
        ...r,
        gen_mwh: genMwh,
        grid_mwh: gridMwh,
        gen_co2_kg: genCo2Kg,
        grid_co2_kg: gridCo2Kg,
        saving_idr: r.cost_saving_idr,
        saving_cum_idr: cum,
      };
    });
  }, [seriesByMonthBase]);

  const seriesPrev = useMemo(() => {
    if (!seriesByMonthPrev) return null;
    let cum = 0;
    return seriesByMonthPrev.map((r) => {
      const genMwh = r.energy_generated_kwh / 1000;
      const gridMwh = r.grid_energy_kwh / 1000;
      const genCo2Kg = r.energy_generated_kwh * GRID_EMISSION_KG_PER_KWH;
      const gridCo2Kg = r.grid_energy_kwh * GRID_EMISSION_KG_PER_KWH;
      cum += r.cost_saving_idr;

      return {
        ...r,
        gen_mwh: genMwh,
        grid_mwh: gridMwh,
        gen_co2_kg: genCo2Kg,
        grid_co2_kg: gridCo2Kg,
        saving_idr: r.cost_saving_idr,
        saving_cum_idr: cum,
      };
    });
  }, [seriesByMonthPrev]);

  const insights = useMemo(() => {
    const last = seriesByMonth[seriesByMonth.length - 1];
    const prev = seriesByMonth[seriesByMonth.length - 2];

    const generationDrop =
      prev && last ? pctChange(last.energy_generated_kwh, prev.energy_generated_kwh) !== null &&
        pctChange(last.energy_generated_kwh, prev.energy_generated_kwh) <= -0.12 : false;

    const gridRise =
      prev && last ? pctChange(last.grid_energy_kwh, prev.grid_energy_kwh) !== null &&
        pctChange(last.grid_energy_kwh, prev.grid_energy_kwh) >= 0.12 : false;

    const gridShare = kpisBase.totalUseKwh > 0 ? kpisBase.totalGridKwh / kpisBase.totalUseKwh : 0;
    const gridShareHigh = gridShare >= 0.6;

    return {
      generationDrop,
      gridRise,
      gridShareHigh,
      gridShare: clamp01(gridShare),
    };
  }, [seriesByMonth, kpisBase.totalGridKwh, kpisBase.totalUseKwh]);

  const tasks = useMemo(() => buildTasksFromInsights(insights), [insights]);

  const taskScopeKey = useMemo(() => {
    const scope = selectedSchoolId ? `school_${selectedSchoolId}` : "all_schools";
    return `${scope}_${maxYear}_${compareMode}_${displayMode}`;
  }, [selectedSchoolId, maxYear, compareMode, displayMode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(safeLocalStorageKey(taskScopeKey));
      if (!raw) {
        setTaskDone({});
        return;
      }
      const parsed = JSON.parse(raw);
      setTaskDone(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setTaskDone({});
    }
  }, [taskScopeKey]);

  useEffect(() => {
    if (selectedSchoolId) setLeftTab("details");
  }, [selectedSchoolId]);

  useEffect(() => {
    if (selectedSchoolId) setLeftView("details");
  }, [selectedSchoolId]);

  useEffect(() => {
    try {
      localStorage.setItem(safeLocalStorageKey(taskScopeKey), JSON.stringify(taskDone));
    } catch {
      void 0;
    }
  }, [taskDone, taskScopeKey]);

  const completedCount = useMemo(() => {
    let c = 0;
    for (const t of tasks) if (taskDone[t.id]) c++;
    return c;
  }, [tasks, taskDone]);

  const kpisDisplay = useMemo(() => {
    if (displayMode === "money") {
      return {
        aLabel: "Total Savings",
        aValue: formatIDR(kpisBase.totalSaveIdr),
        bLabel: "Solar Generation (context)",
        bValue: `${formatNumber(kpisBase.totalGenKwh / 1000, 1)} MWh`,
        cLabel: "Grid Usage (context)",
        cValue: `${formatNumber(kpisBase.totalGridKwh / 1000, 1)} MWh`,
        dLabel: selectedSchoolId ? "Panel Capacity" : "Total Schools",
        dValue: selectedSchoolId ? `${selectedSchool?.panel_capacity_kw ?? 0} kW` : String(kpisBase.totalSchools),
      };
    }

    if (displayMode === "co2") {
      const avoidedKg = kpisBase.totalGenKwh * GRID_EMISSION_KG_PER_KWH;
      const gridKg = kpisBase.totalGridKwh * GRID_EMISSION_KG_PER_KWH;

      return {
        aLabel: "Estimated CO₂ Avoided",
        aValue: `${formatNumber(avoidedKg, 0)} kg`,
        bLabel: "Estimated CO₂ from Grid",
        bValue: `${formatNumber(gridKg, 0)} kg`,
        cLabel: "Self-Consumption Focus",
        cValue: `${formatNumber((1 - insights.gridShare) * 100, 0)}%`,
        dLabel: selectedSchoolId ? "Panel Capacity" : "Total Schools",
        dValue: selectedSchoolId ? `${selectedSchool?.panel_capacity_kw ?? 0} kW` : String(kpisBase.totalSchools),
      };
    }

    return {
      aLabel: "Total Generation",
      aValue: `${formatNumber(kpisBase.totalGenKwh / 1000, 1)} MWh`,
      bLabel: "Total Usage",
      bValue: `${formatNumber(kpisBase.totalUseKwh / 1000, 1)} MWh`,
      cLabel: "Grid Usage",
      cValue: `${formatNumber(kpisBase.totalGridKwh / 1000, 1)} MWh`,
      dLabel: selectedSchoolId ? "Panel Capacity" : "Total Schools",
      dValue: selectedSchoolId ? `${selectedSchool?.panel_capacity_kw ?? 0} kW` : String(kpisBase.totalSchools),
    };
  }, [
    displayMode,
    kpisBase.totalSaveIdr,
    kpisBase.totalGenKwh,
    kpisBase.totalGridKwh,
    kpisBase.totalUseKwh,
    kpisBase.totalSchools,
    selectedSchoolId,
    selectedSchool?.panel_capacity_kw,
    insights.gridShare,
  ]);

  const chartConfig = useMemo(() => {
    if (displayMode === "money") {
      return {
        left: {
          title: "Savings by Month",
          valueKey: "saving_idr",
          yTitle: "Savings",
          tooltip: (v) => formatIDR(v),
          axis: (v) => formatAxisCompact(v),
          compareValueKey: "saving_idr",
        },
        right: {
          title: "Cumulative Savings",
          valueKey: "saving_cum_idr",
          yTitle: "Total Savings",
          tooltip: (v) => formatIDR(v),
          axis: (v) => formatAxisCompact(v),
          compareValueKey: "saving_cum_idr",
        },
      };
    }

    if (displayMode === "co2") {
      return {
        left: {
          title: "Estimated CO₂ from Grid by Month",
          valueKey: "grid_co2_kg",
          yTitle: "kgCO₂",
          tooltip: (v) => `${formatNumber(v, 0)} kgCO₂`,
          axis: (v) => formatAxisCompact(v),
          compareValueKey: "grid_co2_kg",
        },
        right: {
          title: "Estimated CO₂ Avoided (Solar) by Month",
          valueKey: "gen_co2_kg",
          yTitle: "kgCO₂",
          tooltip: (v) => `${formatNumber(v, 0)} kgCO₂`,
          axis: (v) => formatAxisCompact(v),
          compareValueKey: "gen_co2_kg",
        },
      };
    }

    return {
      left: {
        title: "Grid Energy by Month",
        valueKey: "grid_mwh",
        yTitle: "MWh",
        tooltip: (v) => `${formatNumber(v, 2)} MWh`,
        axis: (v) => formatAxisCompact(v),
        compareValueKey: "grid_mwh",
      },
      right: {
        title: "Solar Generation by Month",
        valueKey: "gen_mwh",
        yTitle: "MWh",
        tooltip: (v) => `${formatNumber(v, 2)} MWh`,
        axis: (v) => formatAxisCompact(v),
        compareValueKey: "gen_mwh",
      },
    };
  }, [displayMode]);

  const tableRows = useMemo(() => {
    const acc = new Map();

    for (const l of logs) {
      const id = l.school_id;
      const prev = acc.get(id) || { sum_generated: 0, sum_used: 0, sum_saving: 0 };
      prev.sum_generated += l.energy_generated_kwh;
      prev.sum_used += l.energy_used_kwh;
      prev.sum_saving += l.cost_saving_idr;
      acc.set(id, prev);
    }

    const rows = schools.map((s) => {
      const sums = acc.get(s.school_id) || { sum_generated: 0, sum_used: 0, sum_saving: 0 };
      return {
        school_id: s.school_id,
        school_name: s.school_name,
        sum_generated: sums.sum_generated,
        sum_used: sums.sum_used,
        sum_saving: sums.sum_saving,
      };
    });

    rows.sort((a, b) => sortCompare(a, b, sortKey, sortDir));
    return rows;
  }, [schools, logs, sortKey, sortDir]);

  const subtitle = selectedSchool
    ? `${selectedSchool.city} • ${selectedSchool.district}`
    : `Total schools tracked [synthetic data]: ${schools.length}`;

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIcon = (key) => {
    if (key !== sortKey) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const onToggleTask = (id) => {
    setTaskDone((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="svWrap">
        <div className="svLoading">Loading dashboard…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="svWrap">
        <div className="svError">
          <div className="svErrorTitle">Failed to load School Dashboard</div>
          <div className="svErrorText">{err}</div>
        </div>
      </div>
    );
  }

  if (dataMode === "real") {
    return <SchoolReal onBack={() => setDataMode("synthetic")} />;
  }

  if (err) {
    return (
      <div className="svWrap">
        <div className="svError">
          <div className="svErrorTitle">Failed to load School Dashboard</div>
          <div className="svErrorText">{err}</div>
          <div className="svErrorHint">
            Make sure files exist in <code>public/data/schools.csv</code> and <code>public/data/school_energy_log.csv</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="svWrap">
      <div className="svBoard">
        <div className="svBoardHead">
          <div className="svHeadLeft">
            <div className="svBoardTitle">School Dashboard For West Java</div>
            <div className="svBoardSub">{subtitle}</div>
          </div>

          <div className="svHeadRight">
            <div className="svHeadTopRow">
              <div className="svSeg">
                <button
                  type="button"
                  className={`svSegBtn ${displayMode === "money" ? "isActive" : ""}`}
                  data-short="(Rp)"
                  data-full="Money (Rp)"
                  onClick={() => setDisplayMode("money")}
                >
                </button>
                <button
                  type="button"
                  className={`svSegBtn ${displayMode === "energy" ? "isActive" : ""}`}
                  data-short="(MWh)"
                  data-full="Energy (MWh)"
                  onClick={() => setDisplayMode("energy")}
                >
                </button>
                <button
                  type="button"
                  className={`svSegBtn ${displayMode === "co2" ? "isActive" : ""}`}
                  data-short="(kgCO₂)"
                  data-full="Impact (kgCO₂)"
                  onClick={() => setDisplayMode("co2")}
                >
                </button>
              </div>

              <button
                type="button"
                className={`svCompareBtn ${compareMode === "prevYear" ? "isOn" : ""}`}
                onClick={() => setCompareMode((m) => (m === "prevYear" ? "none" : "prevYear"))}
                aria-pressed={compareMode === "prevYear"}
              >
                Compare: Previous Year
              </button>
            </div>

            <div className="svHeadBottomRow">
              <button
                type="button"
                className="svDataToggleBtn"
                onClick={() => setDataMode((m) => (m === "real" ? "synthetic" : "real"))}
              >
                {dataMode === "real" ? "Switch to Synthetic Data" : "Switch to Real Data"}
              </button>

              {selectedSchoolId && (
                <button
                  type="button"
                  className="svClearBtn"
                  onClick={() => setSelectedSchoolId(null)}
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="svKpiGrid">
          <div className="svKpi">
            <div className="svKpiLabel">{kpisDisplay.aLabel}</div>
            <div className="svKpiValue">{kpisDisplay.aValue}</div>
          </div>

          <div className="svKpi">
            <div className="svKpiLabel">{kpisDisplay.bLabel}</div>
            <div className="svKpiValue">{kpisDisplay.bValue}</div>
          </div>

          <div className="svKpi">
            <div className="svKpiLabel">{kpisDisplay.cLabel}</div>
            <div className="svKpiValue">{kpisDisplay.cValue}</div>
          </div>

          <div className="svKpi svKpiSmall">
            <div className="svKpiLabel">{kpisDisplay.dLabel}</div>
            <div className="svKpiValue">{kpisDisplay.dValue}</div>
          </div>
        </div>

        <div className="svGrid2">
          <AreaChart
            title={chartConfig.left.title}
            series={seriesByMonth}
            valueKey={chartConfig.left.valueKey}
            yTitle={chartConfig.left.yTitle}
            formatTooltipValue={chartConfig.left.tooltip}
            formatAxisValue={chartConfig.left.axis}
            compareSeries={seriesPrev}
            compareValueKey={chartConfig.left.compareValueKey}
          />

          <AreaChart
            title={chartConfig.right.title}
            series={seriesByMonth}
            valueKey={chartConfig.right.valueKey}
            yTitle={chartConfig.right.yTitle}
            formatTooltipValue={chartConfig.right.tooltip}
            formatAxisValue={chartConfig.right.axis}
            compareSeries={seriesPrev}
            compareValueKey={chartConfig.right.compareValueKey}
          />
        </div>

        <div className="svGridBottom">
          <div className="svCard">
            <div className="svCardHead">
              <div className="svCardTitle">Selected School Details</div>
            </div>

            {!selectedSchool ? (
              <div className="svDetails">
                <div className="svDetailsMuted">
                  Click on any school in the table to view details and filter the entire dashboard.
                </div>
                <div className="svDetailsRow">
                  <span className="svDetailsKey">Scope</span>
                  <span className="svDetailsVal">All Schools (West Java)</span>
                </div>
              </div>
            ) : (
              <div className="svLeftInner">
                <div className="svLeftSwitch">
                  <button
                    type="button"
                    className={`svLeftSwitchBtn ${leftView === "details" ? "isActive" : ""}`}
                    onClick={() => setLeftView("details")}
                    aria-pressed={leftView === "details"}
                  >
                    School Details
                  </button>

                  <button
                    type="button"
                    className={`svLeftSwitchBtn ${leftView === "actions" ? "isActive" : ""}`}
                    onClick={() => setLeftView("actions")}
                    aria-pressed={leftView === "actions"}
                  >
                    Action List
                  </button>
                </div>

                <div className="svLeftBody">
                  {leftView === "details" ? (
                    <div className="svLeftBodyScroll">
                      <div className="svMap">
                        <iframe
                          className="svMapFrame"
                          title={`Map: ${selectedSchool.school_name}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${selectedSchool.latitude},${selectedSchool.longitude}&z=14&output=embed`}
                        />
                      </div>

                      <div className="svDetails">
                        <div className="svDetailsRow">
                          <span className="svDetailsKey">School</span>
                          <span className="svDetailsVal">{selectedSchool.school_name}</span>
                        </div>
                        <div className="svDetailsRow">
                          <span className="svDetailsKey">City / District</span>
                          <span className="svDetailsVal">
                            {selectedSchool.city} / {selectedSchool.district}
                          </span>
                        </div>
                        <div className="svDetailsRow">
                          <span className="svDetailsKey">Address</span>
                          <span className="svDetailsVal">{selectedSchool.address}</span>
                        </div>
                        <div className="svDetailsRow">
                          <span className="svDetailsKey">Installation Date</span>
                          <span className="svDetailsVal">{selectedSchool.installation_date}</span>
                        </div>
                        <div className="svDetailsRow">
                          <span className="svDetailsKey">Installation Cost</span>
                          <span className="svDetailsVal">{formatIDR(selectedSchool.installation_cost)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="svLeftBodyScroll">
                      <div className="svTodo">
                        <div className="svTodoHead">
                          <div className="svTodoTitle">Today's Action List</div>
                          <div className="svTodoMeta">
                            {completedCount}/{tasks.length} completed
                          </div>
                        </div>

                        <div className="svTodoSub">
                          These are simple actions students can do to reduce grid usage and improve solar benefits.
                        </div>

                        <div className="svTodoList">
                          {tasks.map((t) => (
                            <label key={t.id} className="svTodoItem">
                              <input
                                type="checkbox"
                                checked={!!taskDone[t.id]}
                                onChange={() => onToggleTask(t.id)}
                              />
                              <span className="svTodoText">{t.label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="svTodoNote">
                          Primary goal is self-consumption: use solar power first to reduce PLN purchases. CO₂ values are estimated.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="svCard svTableCard">
            <div className="svCardHead svCardHeadTight">
              <div className="svCardTitle">Schools Table</div>
              <div className="svCardHint">Click header to sort • Click row to filter</div>
            </div>

            <div className="svTableWrap">
              <table className="svTable">
                <thead>
                  <tr>
                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("school_name")}
                      onKeyDown={(e) => e.key === "Enter" && toggleSort("school_name")}
                      className="isSortable"
                    >
                      <div className="svTh">
                        <div className="svThText svThOneLine">school name</div>
                        <span className="svThSort">{sortIcon("school_name")}</span>
                      </div>
                    </th>

                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("sum_generated")}
                      onKeyDown={(e) => e.key === "Enter" && toggleSort("sum_generated")}
                      className="isSortable isRight"
                    >
                      <div className="svTh svThCenter">
                        <div className="svThText">
                          <span className="svThTop">Sum of</span>
                          <span className="svThBottom">energy generated kwh</span>
                        </div>
                        <span className="svThSort">{sortIcon("sum_generated")}</span>
                      </div>
                    </th>

                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("sum_used")}
                      onKeyDown={(e) => e.key === "Enter" && toggleSort("sum_used")}
                      className="isSortable isRight"
                    >
                      <div className="svTh svThCenter">
                        <div className="svThText">
                          <span className="svThTop">Sum of</span>
                          <span className="svThBottom">energy used kwh</span>
                        </div>
                        <span className="svThSort">{sortIcon("sum_used")}</span>
                      </div>
                    </th>

                    <th
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSort("sum_saving")}
                      onKeyDown={(e) => e.key === "Enter" && toggleSort("sum_saving")}
                      className="isSortable isRight"
                    >
                      <div className="svTh svThCenter">
                        <div className="svThText">
                          <span className="svThTop">Sum of</span>
                          <span className="svThBottom">cost saving idr</span>
                        </div>
                        <span className="svThSort">{sortIcon("sum_saving")}</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((r) => {
                    const active = r.school_id === selectedSchoolId;
                    return (
                      <tr
                        key={r.school_id}
                        className={active ? "isActive" : ""}
                        onClick={() => setSelectedSchoolId(r.school_id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedSchoolId(r.school_id)}
                        title="Click to filter dashboard"
                      >
                        <td className="svSchool">{r.school_name}</td>
                        <td className="isRight">{formatNumber(r.sum_generated, 0)}</td>
                        <td className="isRight">{formatNumber(r.sum_used, 0)}</td>
                        <td className="isRight">{formatIDR(r.sum_saving)}</td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <td>Total (All schools)</td>
                    <td className="isRight">{formatNumber(globalTotals.totalGen, 0)}</td>
                    <td className="isRight">{formatNumber(globalTotals.totalUse, 0)}</td>
                    <td className="isRight">{formatIDR(globalTotals.totalSave)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="svTableFooterNote">
              Charts and KPIs follow the current scope: {selectedSchoolId ? "Selected school" : "All schools"}.
              Table totals are always global.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}