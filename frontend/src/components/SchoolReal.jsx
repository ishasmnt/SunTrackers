import React, { useEffect, useMemo, useState } from "react";
import "../styles/SchoolView.css";

function parseCSV(text) {
    const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim());

    return lines.slice(1).map(line => {
        const cols = line.split(",").map(c => c.trim());
        const o = {};
        headers.forEach((h, i) => (o[h] = cols[i] ?? ""));
        return o;
    });
}

const toNum = v => {
    if (v == null) return 0;

    const s = String(v)
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.]/g, "");

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
};

function formatMonthLabel(raw) {
    if (!raw) return "";
    const m = raw.match(/(\d{4})[-/](\d{2})/);
    if (!m) return "";
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = new Date(y, mo, 1);
    return d.toLocaleString("en-US", { month: "short" }) + " '" + String(y).slice(2);
}

function AreaChart({ title, series, valueKey }) {
    if (!series.length) {
        return (
        <div className="svCard">
            <div className="svCardHead">
            <div className="svCardTitle">{title}</div>
            </div>
            <div className="svChartPlaceholder">No data</div>
        </div>
        );
    }

    const width = 560;
    const height = 240;
    const padL = 50;
    const padB = 60;
    const padT = 20;
    const padR = 20;

    const values = series.map(d => d[valueKey] || 0);
    const max = Math.max(...values, 1);
    const [hover, setHover] = useState(null);

    const pts = series.map((d, i) => {
        const x =
        padL +
        (i / (series.length - 1 || 1)) * (width - padL - padR);

        const y =
        height -
        padB -
        (d[valueKey] / max) * (height - padT - padB);

        return { x, y, v: d[valueKey], m: d.month };
    });

    const linePath = pts
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

    const areaPath =
        `${linePath} L ${pts[pts.length - 1].x} ${height - padB}` +
        ` L ${pts[0].x} ${height - padB} Z`;

    const yTicks = 4;

    return (
        <div className="svCard">
        <div className="svCardHead">
            <div className="svCardTitle">{title}</div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="svChart">
            {[...Array(yTicks + 1)].map((_, i) => {
                const val = (max / yTicks) * i;
                const y = height - padB - (val / max) * (height - padT - padB);
                return (
                    <g key={i}>
                    <line
                        x1={padL}
                        x2={width - padR}
                        y1={y}
                        y2={y}
                        className="svGridLine"
                    />
                    <text
                        x={padL - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="svAxisText"
                    >
                        {Math.round(val).toLocaleString()}
                    </text>
                    </g>
                );
            })}

            {pts.map((p, i) => (
                <text
                    key={i}
                    x={p.x}
                    y={height - padB + 18}
                    transform={`rotate(-35 ${p.x} ${height - padB + 18})`}
                    textAnchor="end"
                    className="svAxisText"
                >
                    {formatMonthLabel(p.m)}
                </text>
            ))}
            <path d={areaPath} className="svArea" />
            <path d={linePath} className="svLine" fill="none" />
            {pts.map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    className="svDot"
                    onMouseEnter={() => setHover(p)}
                    onMouseMove={() => setHover(p)}
                    onMouseLeave={() => setHover(null)}
                />
            ))}
            {hover && (
                <g className="svTooltip">
                    <rect
                        x={hover.x - 48}
                        y={hover.y - 36}
                        width="96"
                        height="26"
                        rx="6"
                        className="svTooltipBg"
                    />
                    <text
                        x={hover.x}
                        y={hover.y - 18}
                        textAnchor="middle"
                        className="svTooltipText"
                    >
                    {hover.v.toLocaleString()}
                    </text>
                </g>
            )}
        </svg>
        </div>
    );
}

export default function SchoolReal({ onBack }) {
    const [schools, setSchools] = useState([]);
    const [logs, setLogs] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        Promise.all([
        fetch("/data/disdik-dftr_kd_sklh_mngh_kejuruan_smk_brdsrkn_kcmtn_di_jawa_barat_data.csv").then(r => r.text()),
        fetch("/data/Monitoring_Prod_Energy_PLTS_Sekolah_2024-2025_new.csv").then(r => r.text())
        ])
        .then(([s, l]) => {
            const schoolsRows = parseCSV(s).map(r => ({
            id: r.id,
            name: r.school_name,
            city: r.district_city_name,
            address: r.school_address,
            status: r.school_status
            }));
            const logsRows = parseCSV(l).map(r => ({
                plantName: r.plant_name?.toLowerCase(),
                month: r.updated_time?.slice(0, 7),
                production: toNum(r["production-this_month(kwh)"]),
                savings: toNum(r["anticipated_yield(idr)_tarif_sosial_pln_-_rp.900/kwh"]),
                capacity: toNum(r.capacity)
            }));

            setSchools(schoolsRows);
            setLogs(logsRows);
            setLoading(false);
        })
        .catch(() => {
            setErr("Failed to load real data CSV");
            setLoading(false);
        });
    }, []);

    const selectedSchool = useMemo(
        () => schools.find(s => s.id === selectedSchoolId),
        [schools, selectedSchoolId]
    );

        const scopeLogs = useMemo(() => {
            if (!selectedSchoolId) return logs;

            const school = schools.find(s => s.id === selectedSchoolId);
            if (!school) return [];

            const key = school.name.toLowerCase();
            return logs.filter(l => l.plantName?.includes(key));
        }, [logs, schools, selectedSchoolId]);

        const totalCapacity = useMemo(() => {
            const map = new Map();

            logs.forEach(l => {
                if (!l.plantName || !l.capacity) return;
                map.set(
                l.plantName,
                Math.max(map.get(l.plantName) || 0, l.capacity)
                );
            });

            return Array.from(map.values()).reduce((a, b) => a + b, 0);
        }, [logs]);

        const kpis = useMemo(() => {
            let prod = 0;
            let savings = 0;
            let cap = 0;

            scopeLogs.forEach(l => {
                prod += l.production;
                savings += l.savings;
                cap = Math.max(cap, l.capacity || 0);
            });

            return {
                totalProd: prod,
                totalSavings: savings,
                capacity: selectedSchoolId ? cap : totalCapacity,
                schools: schools.length
            };
        }, [scopeLogs, schools.length, selectedSchoolId, totalCapacity]);

        const seriesByMonth = useMemo(() => {
            const map = new Map();

            scopeLogs.forEach(l => {
                if (!l.month) return;
                if (!map.has(l.month)) {
                map.set(l.month, {
                    month: l.month,
                    production: 0,
                    savings: 0,
                });
                }
                const row = map.get(l.month);
                row.production += l.production;
                row.savings += l.savings;
            });

            const all = Array.from(map.values()).sort((a, b) =>
                a.month.localeCompare(b.month)
            );

            if (!selectedSchoolId) {
                return all.slice(-12);
            }

            return all;
        }, [scopeLogs, selectedSchoolId]);

    if (loading) {
        return (
        <div className="svWrap">
            <div className="svLoading">Loading real dashboard…</div>
        </div>
        );
    }

    if (err) {
        return (
        <div className="svWrap">
            <div className="svError">
            <div className="svErrorTitle">Real Data Error</div>
            <div className="svErrorText">{err}</div>
            </div>
        </div>
        );
    }

    return (
        <div className="svWrap">
        <div className="svBoard">
            <div className="svBoardHead">
                <div className="svHeadLeft">
                    <div className="svBoardTitle">
                    Schools Dashboard For West Java
                    </div>
                    <div className="svBoardSub">
                    Live monitoring with Real Datasets
                    </div>
                </div>
                <div className="svHeadRight">
                    <button type="button" className="svDataToggleBtn" onClick={onBack}>Switch to Synthetic Data</button>
                    {selectedSchoolId && (
                        <button type="button" className="svClearBtn" onClick={() => setSelectedSchoolId(null)}>Clear Selection</button>
                    )}
                </div>
            </div>
            <div className="svKpiGrid">
                <div className="svKpi">
                    <div className="svKpiLabel">Total Production</div>
                    <div className="svKpiValue">
                        {kpis.totalProd.toLocaleString()} kWh
                    </div>
                </div>
                <div className="svKpi">
                    <div className="svKpiLabel">Total Savings</div>
                    <div className="svKpiValue">
                        Rp {kpis.totalSavings.toLocaleString()}
                    </div>
                </div>
                <div className="svKpi">
                    <div className="svKpiLabel">Capacity</div>
                    <div className="svKpiValue">
                    {kpis.capacity || "-"} kW
                    </div>
                </div>
                <div className="svKpi">
                    <div className="svKpiLabel">Total Schools</div>
                    <div className="svKpiValue">{kpis.schools}</div>
                </div>
            </div>
            <div className="svGrid2">
            <div className="svCard">
                <AreaChart
                    title="Monthly Solar Energy Production"
                    series={seriesByMonth}
                    valueKey="production"
                    yTitle="kWh"
                    formatTooltipValue={v => `${v.toLocaleString()} kWh`}
                    formatAxisValue={v => v.toLocaleString()}
                />
            </div>
            <div className="svCard">
                <AreaChart
                    title="Monthly Anticipated Yield"
                    series={seriesByMonth}
                    valueKey="savings"
                    yTitle="Rp"
                    formatTooltipValue={v => `Rp ${v.toLocaleString()}`}
                    formatAxisValue={v => v.toLocaleString()}
                />
            </div>
            </div>
            <div className="svGridBottom">
            <div className="svCard">
                <div className="svCardHead">
                <div className="svCardTitle">School Details</div>
                </div>
                {!selectedSchool ? (
                <div className="svDetails">
                    <div className="svDetailsMuted">
                    Click a school in the table to view details.
                    </div>
                </div>
                ) : (
                <div className="svDetails">
                    {selectedSchool && (
                        <div className="svMapWrap">
                            <iframe
                            title="school-map"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                                selectedSchool.name + ", " + selectedSchool.address + ", " + selectedSchool.city
                            )}&output=embed`}
                            width="100%"
                            height="220"
                            style={{ border: 0, borderRadius: 12 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        )}
                    <div className="svDetailsRow">
                        <span className="svDetailsKey">School</span>
                        <span className="svDetailsVal">{selectedSchool.name}</span>
                    </div>
                    <div className="svDetailsRow">
                        <span className="svDetailsKey">City</span>
                        <span className="svDetailsVal">{selectedSchool.city}</span>
                    </div>
                    <div className="svDetailsRow">
                        <span className="svDetailsKey">Address</span>
                        <span className="svDetailsVal">{selectedSchool.address}</span>
                    </div>
                    <div className="svDetailsRow">
                        <span className="svDetailsKey">Status</span>
                        <span className="svDetailsVal">{selectedSchool.status}</span>
                    </div>
                </div>
                )}
            </div>

            <div className="svCard svTableCard">
                <div className="svCardHead">
                <div className="svCardTitle">Schools Table (Real)</div>
                </div>
                <div className="svTableWrap">
                <table className="svTable">
                    <thead>
                    <tr>
                        <th>School</th>
                        <th className="isRight">Production (kWh)</th>
                        <th className="isRight">Yield (Rp)</th>
                    </tr>
                    </thead>
                    <tbody>
                        {schools.map(s => {
                            const key = s.name.toLowerCase();
                            const rows = logs.filter(l => l.plantName?.includes(key));
                            const prod = rows.reduce((a, b) => a + b.production, 0);
                            const yieldRp = rows.reduce((a, b) => a + b.savings, 0);
                            return (
                                <tr
                                    key={s.id}
                                    className={selectedSchoolId === s.id ? "isActive" : ""}
                                    onClick={() => setSelectedSchoolId(s.id)}
                                >
                                <td>{s.name}</td>
                                <td className="isRight">{prod.toLocaleString()}</td>
                                <td className="isRight">{yieldRp.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
                <div className="svTableFooterNote">
                Click row to filter real dashboard
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}