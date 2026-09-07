import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.scss';
import {
  buildCalendar,
  CALENDAR_STYLES,
  type CalendarStyle,
  PAGE_DIMENSIONS,
  PAPER_LABELS,
  PAPER_SIZE_MM,
  PAPER_SIZES,
  parseMonth,
  parseSize,
  parseStyle,
  type PaperSize,
  STYLE_LABELS,
} from './calendar';

/** CSS treats 1mm as exactly 96/25.4 reference pixels. */
const MM_TO_PX = 96 / 25.4;

interface Params {
  year: number;
  month: number;
  size: PaperSize;
  style: CalendarStyle;
}

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function parseYearDraft(value: string): number | null {
  if (!/^\d{4}$/.test(value.trim())) return null;
  return Number(value);
}

function shiftMonth(year: number, month: number, offset: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function readParams(): Params {
  const query = new URLSearchParams(window.location.search);
  const { year, month } = parseMonth(query.get('month'));
  const size = parseSize(query.get('size'));
  const style = parseStyle(query.get('style'));
  return { year, month, size, style };
}

function App() {
  const [params, setParams] = useState<Params>(readParams);
  const { year, month, size, style } = params;
  const [yearDraft, setYearDraft] = useState(String(year));

  // Reflect browser back/forward navigation.
  useEffect(() => {
    const onPopState = () => setParams(readParams());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    setYearDraft(String(year));
  }, [year]);

  // Drive the printed sheet size/orientation via a dynamic @page rule.
  useEffect(() => {
    const style = document.createElement('style');
    const printPageSize = size === 'A3' ? PAGE_DIMENSIONS.A3 : PAGE_DIMENSIONS.A4;
    style.textContent = `@page { size: ${printPageSize}; margin: 0; }`;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [size]);

  const calendar = useMemo(() => buildCalendar(year, month), [year, month]);
  const monthValue = formatMonth(year, month);

  // Scale the preview down to fit narrow (mobile/tablet) screens, without
  // affecting the printed output which always renders at natural size.
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setStageWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  const naturalWidthPx = PAPER_SIZE_MM[size].width * MM_TO_PX;
  const naturalHeightPx = PAPER_SIZE_MM[size].height * MM_TO_PX;
  const scale = stageWidth === 0 ? 1 : Math.min(1, stageWidth / naturalWidthPx);

  const updateUrl = (nextMonth: string, nextSize: PaperSize, nextStyle: CalendarStyle) => {
    const query = new URLSearchParams();
    query.set('month', nextMonth);
    query.set('size', nextSize);
    query.set('style', nextStyle);
    window.history.pushState(null, '', `?${query.toString()}`);
    setParams(readParams());
  };

  const commitYear = () => {
    const nextYear = parseYearDraft(yearDraft);
    if (nextYear === null) {
      setYearDraft(String(year));
      return;
    }
    updateUrl(formatMonth(nextYear, month), size, style);
  };

  const updateRelativeMonth = (offset: number) => {
    const next = shiftMonth(parseYearDraft(yearDraft) ?? year, month, offset);
    updateUrl(formatMonth(next.year, next.month), size, style);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Calendar Printing Template</h1>
        <p>Pick a month, paper size and style, then print or save as PDF.</p>
      </header>

      <div className={styles.toolbar}>
        <label>
          Year
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={yearDraft}
            onChange={(event) => setYearDraft(event.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={commitYear}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') {
                setYearDraft(String(year));
                event.currentTarget.blur();
              }
            }}
          />
        </label>
        <div className={styles.monthField}>
          <span>Month</span>
          <div className={styles.monthControls}>
            <button
              type="button"
              className={styles.monthButton}
              onClick={() => updateRelativeMonth(-1)}
              aria-label="Previous month"
            >
              Prev
            </button>
            <select
              value={month}
              aria-label="Month"
              onChange={(event) =>
                updateUrl(
                  formatMonth(parseYearDraft(yearDraft) ?? year, Number(event.target.value)),
                  size,
                  style,
                )
              }
            >
              {MONTH_OPTIONS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.monthButton}
              onClick={() => updateRelativeMonth(1)}
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        </div>
        <label>
          Paper
          <select
            value={size}
            onChange={(event) => updateUrl(monthValue, event.target.value as PaperSize, style)}
          >
            {PAPER_SIZES.map((option) => (
              <option key={option} value={option}>
                {PAPER_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Style
          <select
            value={style}
            onChange={(event) => updateUrl(monthValue, size, event.target.value as CalendarStyle)}
          >
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

      <div className={styles.pageStage} ref={stageRef}>
        <div
          className={styles.pageViewport}
          style={isPrinting ? undefined : { width: naturalWidthPx * scale, height: naturalHeightPx * scale }}
        >
          <div
            className={styles.page}
            data-size={size}
            data-theme={style}
            style={isPrinting ? undefined : { transform: `scale(${scale})` }}
          >
            <h1 className={styles.title}>
              {style === 'simple' ? calendar.shortTitle : calendar.longTitle}
            </h1>
            <div className={styles.calendar}>
              <div className={styles.weekdays}>
                {calendar.weekdays.map((weekday, index) => (
                  <div
                    key={weekday}
                    className={index >= 5 ? `${styles.weekday} ${styles.weekend}` : styles.weekday}
                  >
                    {weekday}
                  </div>
                ))}
              </div>
              <div
                className={styles.grid}
                style={{ gridTemplateRows: `repeat(${calendar.weeks.length}, 1fr)` }}
              >
                {calendar.weeks.flatMap((week, rowIndex) =>
                  week.map((day, columnIndex) => (
                    <div
                      key={`${rowIndex}-${columnIndex}`}
                      className={[
                        styles.cell,
                        columnIndex >= 5 ? styles.weekend : '',
                        day === null ? styles.empty : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {day !== null && <span className={styles.dayNum}>{day}</span>}
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        Prepared by <a href="https://www.georgetymvios.com" target="_blank" rel="noopener noreferrer">George Tymvios</a> | Copyright {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
