import { useEffect, useMemo, useState } from "react";
import styles from "./App.module.scss";
import {
  buildCalendar,
  CALENDAR_STYLES,
  type CalendarStyle,
  PAGE_DIMENSIONS,
  PAPER_LABELS,
  PAPER_SIZES,
  parseMonth,
  parseSize,
  parseStyle,
  type PaperSize,
  STYLE_LABELS,
} from "./calendar";

interface Params {
  year: number;
  month: number;
  size: PaperSize;
  style: CalendarStyle;
}

function readParams(): Params {
  const query = new URLSearchParams(window.location.search);
  const { year, month } = parseMonth(query.get("month"));
  const size = parseSize(query.get("size"));
  const style = parseStyle(query.get("style"));
  return { year, month, size, style };
}

function App() {
  const [{ year, month, size, style }, setParams] = useState<Params>(readParams);

  // Reflect browser back/forward navigation.
  useEffect(() => {
    const onPopState = () => setParams(readParams());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Drive the printed sheet size/orientation via a dynamic @page rule.
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@page { size: ${PAGE_DIMENSIONS[size]}; margin: 0; }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [size]);

  const calendar = useMemo(() => buildCalendar(year, month), [year, month]);
  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  const updateUrl = (nextMonth: string, nextSize: PaperSize, nextStyle: CalendarStyle) => {
    const query = new URLSearchParams();
    query.set("month", nextMonth);
    query.set("size", nextSize);
    query.set("style", nextStyle);
    window.history.pushState(null, "", `?${query.toString()}`);
    setParams(readParams());
  };

  return (
    <div className={styles.app}>
      <div className={styles.toolbar}>
        <label>
          Month
          <input
            type="month"
            value={monthValue}
            onChange={(event) => updateUrl(event.target.value || monthValue, size, style)}
          />
        </label>
        <label>
          Paper
          <select value={size} onChange={(event) => updateUrl(monthValue, event.target.value as PaperSize, style)}>
            {PAPER_SIZES.map((option) => (
              <option key={option} value={option}>
                {PAPER_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Style
          <select value={style} onChange={(event) => updateUrl(monthValue, size, event.target.value as CalendarStyle)}>
            {CALENDAR_STYLES.map((option) => (
              <option key={option} value={option}>
                {STYLE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.printButton} onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className={styles.page} data-size={size} data-theme={style}>
        <h1 className={styles.title}>{calendar.title}</h1>
        <div className={styles.calendar}>
          <div className={styles.weekdays}>
            {calendar.weekdays.map((weekday, index) => (
              <div key={weekday} className={index >= 5 ? `${styles.weekday} ${styles.weekend}` : styles.weekday}>
                {weekday}
              </div>
            ))}
          </div>
          <div className={styles.grid} style={{ gridTemplateRows: `repeat(${calendar.weeks.length}, 1fr)` }}>
            {calendar.weeks.flatMap((week, rowIndex) =>
              week.map((day, columnIndex) => (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  className={[styles.cell, columnIndex >= 5 ? styles.weekend : "", day === null ? styles.empty : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day !== null && <span className={styles.dayNum}>{day}</span>}
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
