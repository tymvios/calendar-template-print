# Printable Calendar Template

A small React + TypeScript + Vite app that renders a **print-ready monthly calendar**.
The month, paper size, and visual style are all driven by the URL query string, so a
given calendar is a shareable, bookmarkable link that prints cleanly.

Example:

```
http://localhost:5173/?month=2026-07&size=A5&style=simple
```

renders **July 2026** on an **A5 landscape** sheet using the **Simple** style.

## Features

- Monthly grid, **Monday-first**, weeks as rows (5 or 6 rows as needed).
- Weekday header row; **weekends highlighted**.
- Each day cell shows the day number with blank space for writing.
- **Print-ready**: a dynamic `@page` rule sets the exact sheet size and orientation,
  the on-screen toolbar is hidden when printing, and background shading is preserved.
- Toolbar with a month picker, paper-size selector, style selector, and a **Print** button.
- State lives in the URL and stays in sync with browser back/forward navigation.

## URL parameters

| Param   | Values                                 | Default       |
| ------- | -------------------------------------- | ------------- |
| `month` | `YYYY-MM` (e.g. `2026-07`)             | current month |
| `size`  | `A6`, `A6SQ`, `A5`, `A5SQ`, `A4`, `A3` | `A5`          |
| `style` | `simple`, `modern`, `roundy`           | `simple`      |

Invalid or missing values fall back to the defaults above.

### Paper sizes

All rectangular sizes are **landscape**. The square sizes use the landscape width for both dimensions.

| Value  | Label        | Dimensions    |
| ------ | ------------ | ------------- |
| `A6`   | A6 landscape | 148mm × 105mm |
| `A6SQ` | A6 square    | 148mm × 148mm |
| `A5`   | A5 landscape | 210mm × 148mm |
| `A5SQ` | A5 square    | 210mm × 210mm |
| `A4`   | A4 landscape | 297mm × 210mm |
| `A3`   | A3 landscape | 420mm × 297mm |

### Styles

- **Simple** — plain black grid (default).
- **Modern** — borderless page, accent-colored title and day numbers, soft grid lines.
- **Roundy** — rounded page, pill-shaped weekday headers, gapped cells with rounded corners.

## Getting started

```bash
pnpm install
pnpm dev       # start the dev server
pnpm build     # type-check and build for production
pnpm preview   # preview the production build
pnpm lint      # run Oxlint
```

Then open the printed URL, choose a month/size/style (or edit the query string), and use
the **Print** button (or your browser's print dialog). Set margins to _None_ / _Default_
in the print dialog — the sheet size is already defined by the app.

## Project structure

```
src/
  main.tsx            App entry point; imports global styles
  App.tsx             Toolbar + calendar page; reads/writes URL params
  App.module.scss     Calendar layout, per-size dimensions, and theme blocks
  index.scss          Global CSS variables and base reset
  calendar.ts         Params parsing, paper sizes/styles, and grid model
```

## Extending

**Add a paper size** — in [`src/calendar.ts`](src/calendar.ts) add the value to `PaperSize`,
`PAPER_SIZES`, `PAGE_DIMENSIONS`, and `PAPER_LABELS`, then add a matching
`.page[data-size="…"]` block in [`src/App.module.scss`](src/App.module.scss).

**Add a style** — in [`src/calendar.ts`](src/calendar.ts) add the name to `CalendarStyle`,
`CALENDAR_STYLES`, and `STYLE_LABELS`, then add a `.page[data-theme="…"]` block in
[`src/App.module.scss`](src/App.module.scss). The component and toolbar are data-driven,
so no changes to [`src/App.tsx`](src/App.tsx) are required.

## Tech stack

- React 19
- TypeScript
- Vite
- SCSS modules (via `sass`)
- Oxlint
