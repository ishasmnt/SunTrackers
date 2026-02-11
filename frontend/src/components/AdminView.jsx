import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import Papa from "papaparse";
import "../styles/AdminView.css";

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

function normalizeName(s) {
  return String(s || "")
    .toUpperCase()
    .replace(/\bKAB\.?\s*/i, "")
    .replace(/\bKOTA\.?\s*/i, "")
    .replace(/^KABUPATEN\s+/i, "")
    .replace(/^KOTA\s+/i, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function digitsOnly(s) {
  return String(s ?? "").replace(/\D/g, "");
}

function normalizeCodes({ kd_propinsi, kd_dati2, city_district_code }) {
  const prov = digitsOnly(kd_propinsi);
  const dati2 = digitsOnly(kd_dati2);
  const csv = digitsOnly(city_district_code);

  const codes = new Set();

  if (dati2) codes.add(dati2);
  if (prov && dati2) codes.add(`${prov}${dati2}`);

  if (csv) {
    codes.add(csv);
    if (csv.length === 4 && csv.startsWith("32")) codes.add(csv.slice(2));
    if (csv.length === 2) codes.add(`32${csv}`);
  }

  return Array.from(codes);
}

function makeBins(maxVal) {
  const m = Math.max(0, Number(maxVal) || 0);
  if (m <= 0) return [0, 1, 2, 3, 4];
  return [0, m * 0.2, m * 0.4, m * 0.6, m * 0.8];
}

function getColor(value, bins) {
  if (value === null || value === undefined) return "#eeeeee";
  const v = Number(value) || 0;

  if (v >= bins[4]) return "#1b5e20";
  if (v >= bins[3]) return "#2e7d32";
  if (v >= bins[2]) return "#66bb6a";
  if (v >= bins[1]) return "#a5d6a7";
  return "#e8f5e9";
}

export default function AdminView() {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const didFitRef = useRef(false);

  const [geo, setGeo] = useState(null);
  const [rows, setRows] = useState([]);
  const [year, setYear] = useState(2024);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/geo/Kota_Kabupaten_Jawa_Barat.geojson");
      if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
      const gj = await res.json();
      setGeo(gj);
      didFitRef.current = false;
    })().catch((e) => console.error("Failed to load geojson:", e));
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/data/admin.csv");
      if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
      const text = await res.text();
      const parsed = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      setRows(parsed.data || []);
    })().catch((e) => console.error("Failed to load csv:", e));
  }, []);

  const yearData = useMemo(() => {
    const byCode = new Map();
    const byName = new Map();
    const filtered = rows.filter((r) => Number(r.year) === Number(year));

    for (const r of filtered) {
      const val = Number(r.number_of_power_plants) || 0;

      const codes = normalizeCodes({ city_district_code: r.city_district_code });
      for (const c of codes) byCode.set(c, val);

      const name = normalizeName(r.city_district_name);
      if (name) byName.set(name, val);
    }

    return { byCode, byName, filtered };
  }, [rows, year]);

  const selectedValue = useMemo(() => {
    if (!selected) return null;

    const selectedCodes = normalizeCodes({
      kd_propinsi: selected.kd_propinsi,
      kd_dati2: selected.kd_dati2,
      city_district_code: selected.code,
    });

    for (const c of selectedCodes) {
      if (yearData.byCode.has(c)) return yearData.byCode.get(c);
    }

    const nameNorm = normalizeName(selected.name);
    if (nameNorm && yearData.byName.has(nameNorm)) return yearData.byName.get(nameNorm);

    return 0;
  }, [selected, yearData]);

  const total = useMemo(
    () => yearData.filtered.reduce((acc, r) => acc + (Number(r.number_of_power_plants) || 0), 0),
    [yearData.filtered]
  );

  const maxVal = useMemo(() => {
    let m = 0;
    for (const r of yearData.filtered) m = Math.max(m, Number(r.number_of_power_plants) || 0);
    return m;
  }, [yearData.filtered]);

  const bins = useMemo(() => makeBins(maxVal), [maxVal]);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: [-6.95, 107.6],
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      geoLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geo) return;

    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
      geoLayerRef.current = null;
    }

    const getValueForFeature = (props) => {
      const codes = normalizeCodes({
        kd_propinsi: props?.kd_propinsi,
        kd_dati2: props?.kd_dati2,
      });

      for (const c of codes) {
        if (yearData.byCode.has(c)) return yearData.byCode.get(c);
      }

      const nameNorm = normalizeName(props?.nm_dati2);
      if (nameNorm && yearData.byName.has(nameNorm)) return yearData.byName.get(nameNorm);

      return null;
    };

    const isFeatureSelected = (props) => {
      if (!selected) return false;

      const featureCodes = normalizeCodes({
        kd_propinsi: props?.kd_propinsi,
        kd_dati2: props?.kd_dati2,
      });

      const selectedCodes = normalizeCodes({
        kd_propinsi: selected.kd_propinsi,
        kd_dati2: selected.kd_dati2,
        city_district_code: selected.code,
      });

      const featureSet = new Set(featureCodes);
      for (const c of selectedCodes) {
        if (featureSet.has(c)) return true;
      }

      const a = normalizeName(props?.nm_dati2);
      const b = normalizeName(selected.name);
      return !!a && !!b && a === b;
    };

    const layer = L.geoJSON(geo, {
      style: (feature) => {
        const props = feature?.properties || {};
        const value = getValueForFeature(props);
        const sel = isFeatureSelected(props);

        return {
          weight: sel ? 3 : 1,
          color: sel ? "#000000" : "#263238",
          fillOpacity: sel ? 0.85 : 0.65,
          fillColor: getColor(value, bins),
          dashArray: value === null ? "4 4" : undefined,
        };
      },
      onEachFeature: (feature, l) => {
        const props = feature?.properties || {};
        const rawName = props?.nm_dati2 || "Wilayah";
        const value = getValueForFeature(props);

        const tooltipHtml = [
          `<div class="tt">`,
          `<div class="ttTitle">Year: ${year}</div>`,
          `<div class="ttRow"><b>City/Regency:</b> ${rawName}</div>`,
          `<div class="ttRow"><b>Number of Power Plants:</b> ${value ?? "-"}</div>`,
          `</div>`,
        ].join("");

        l.bindTooltip(tooltipHtml, {
          sticky: true,
          direction: "top",
          className: "adminMapTooltip",
        });

        l.on("mouseover", () => l.setStyle({ weight: 2, fillOpacity: 0.8 }));
        l.on("mouseout", () => layer.resetStyle(l));

        l.on("click", () => {
          setSelected({
            kd_propinsi: props?.kd_propinsi,
            kd_dati2: props?.kd_dati2,
            code: props?.kd_dati2,
            name: rawName,
          });
        });
      },
    });

    layer.addTo(map);
    geoLayerRef.current = layer;

    if (!didFitRef.current) {
      try {
        const b = layer.getBounds();
        if (b.isValid()) {
          map.fitBounds(b, { padding: [20, 20] });
          didFitRef.current = true;
        }
      } catch {
        
      }
    }
  }, [geo, yearData, bins, year, selected]);

  return (
    <div className="adminViewWrap">
      <div className="adminMapWrap">
        <div className="adminMapHeader">
          <div>
            <div className="adminTitle">Power Plant Map (District/City)</div>
            <div className="adminSubtitle">Year: {year} • Hover for tooltip • Click for detail</div>
          </div>
        </div>

        <div className="adminMapCanvas">
          <div ref={mapDivRef} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      <aside className="adminSideWrap">
        <div className="adminPanelTitle">Adjust Map Display</div>

        <div className="adminPanelSection">
          <div className="adminPanelLabel">Year</div>
          <div className="yearGrid">
            {YEARS.map((y) => (
              <button
                key={y}
                className={`yearBtn ${y === year ? "yearBtnActive" : ""}`}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="adminPanelSection">
          <div className="infoCard">
            <div className="infoLabel">Total Power Plant Count</div>
            <div className="bigNumber">{total}</div>
            <div className="infoHint">Year {year} • Unit</div>
          </div>
        </div>

        <div className="adminPanelSection">
          <div className="infoCard">
            <div className="infoLabel">Region Details</div>

            {!selected ? (
              <div className="infoHint" style={{ marginTop: 8 }}>
                Click district/city on the map to display details here.
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <div className="selectedName">{selected.name}</div>
                <div className="selectedValue">
                  Number of Power Plants: <strong>{selectedValue ?? 0}</strong>
                </div>
                <button className="clearSelectionBtn" onClick={() => setSelected(null)}>
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="adminPanelSection">
          <div className="legendCard">
            <div className="infoLabel">Legend</div>
            <div className="legendRow">
              {["Low", "", "", "", "High"].map((t, i) => (
                <div key={i} className="legendItem">
                  <span
                    className="legendSwatch"
                    style={{
                      background: getColor(i === 0 ? bins[1] * 0.5 : bins[i] + 0.0001, bins),
                    }}
                  />
                  <span className="legendText">{t}</span>
                </div>
              ))}
            </div>
            <div className="infoHint" style={{ marginTop: 6 }}>
              Darker color = greater number of generators.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}