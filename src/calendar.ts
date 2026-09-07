export type PaperSize = 'A6' | 'A6SQ' | 'A5' | 'A5SQ' | 'A4' | 'A3';

export const PAPER_SIZES: PaperSize[] = ['A6', 'A6SQ', 'A5', 'A5SQ', 'A4', 'A3'];

/** Landscape sheet dimensions used for the CSS `@page { size }` rule. */
export const PAGE_DIMENSIONS: Record<PaperSize, string> = {
  A6: '148mm 105mm',
  A6SQ: '148mm 148mm',
  A5: '210mm 148mm',
  A5SQ: '210mm 210mm',
  A4: '297mm 210mm',
  A3: '420mm 297mm',
};

/** Landscape sheet dimensions in millimetres, matching the `.page` CSS sizes. */
export const PAPER_SIZE_MM: Record<PaperSize, { width: number; height: number }> = {
  A6: { width: 148, height: 105 },
  A6SQ: { width: 148, height: 148 },
  A5: { width: 210, height: 148 },
  A5SQ: { width: 210, height: 210 },
  A4: { width: 297, height: 210 },
  A3: { width: 420, height: 297 },
};

/** Human-readable label for each paper size shown in the selector. */
export const PAPER_LABELS: Record<PaperSize, string> = {
  A6: 'A6 landscape',
  A6SQ: 'A6 square',
  A5: 'A5 landscape',
  A5SQ: 'A5 square',
  A4: 'A4 landscape',
  A3: 'A3 landscape',
};

export type CalendarStyle = 'simple' | 'modern' | 'roundy' | 'notebook';

export const CALENDAR_STYLES: CalendarStyle[] = ['simple', 'modern', 'roundy', 'notebook'];

/** Human-readable label for each calendar style shown in the selector. */
export const STYLE_LABELS: Record<CalendarStyle, string> = {
  simple: 'Simple',
  modern: 'Modern',
  roundy: 'Roundy',
  notebook: 'Notebook',
};

export interface CalendarModel {
  year: number;
  /** 1-12 */
  month: number;
  /** e.g. "Jul 2026" */
  shortTitle: string;
  /** e.g. "July 2026" */
  longTitle: string;
  /** Weekday header labels, Monday first. */
  weekdays: string[];
  /** Rows of 7 cells; `null` means a padding cell outside the month. */
  weeks: (number | null)[][];
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Parse a `YYYY-MM` string, falling back to the current month when invalid. */
export function parseMonth(input: string | null): { year: number; month: number } {
  const match = input ? /^(\d{4})-(\d{2})$/.exec(input.trim()) : null;
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Parse a paper size, falling back to A5 when unknown. */
export function parseSize(input: string | null): PaperSize {
  const value = (input ?? '').toUpperCase();
  return (PAPER_SIZES as string[]).includes(value) ? (value as PaperSize) : 'A5';
}

/** Parse a calendar style, falling back to "simple" when unknown. */
export function parseStyle(input: string | null): CalendarStyle {
  const value = (input ?? '').toLowerCase();
  return (CALENDAR_STYLES as string[]).includes(value) ? (value as CalendarStyle) : 'simple';
}

/** Build a Monday-first month grid for the given year/month (month is 1-12). */
export function buildCalendar(year: number, month: number): CalendarModel {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset (0=Mon..6=Sun).
  const startOffset = (first.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const shortTitle = first.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const longTitle = first.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return { year, month, shortTitle, longTitle, weekdays: WEEKDAYS, weeks };
}
