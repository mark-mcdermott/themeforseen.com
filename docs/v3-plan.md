# ThemeForseen v3: findings and build plan

Status: **approved 2026-09-29**, defaults D1 to D9 included · milestones 0 to 9 complete; live at themeforseen.com since 2026-09-30

This document answers the inspection brief: what the product really does, where
the mock and the product disagree, how the machine should be built, what assets
are missing, and the order of work.

Authority, in order: `homepage-v2.png` for composition, `cloud-logo-sheet.png`
for logo geometry, the `theme-forseen` source for product behavior.


## 1. Where things stand

| | |
|---|---|
| Repo | private, `mark-mcdermott/themeforseen.com`, default branch `main` |
| `main` | still the v1 SvelteKit app (tag `v1-final`, branch `v1-sveltekit`) |
| v2 | never pushed; kept locally as branch `v2-astro`, tag `v2-aborted` |
| v3 | branch `v3`, cut from `main`, tree cleared |
| Live site | `themeforseen.com`, Vercel project `themeforseen-com` on the mark-mcdermott team, deployed from `main`, since 2026-09-30 |
| Product | `theme-forseen` 0.5.0 on npm; source at `~/Dev/theme-forseen-proj/theme-forseen`; last commit 2026-01-03 |

v3 starts from an empty tree, so there is no marketing-site architecture to
inspect. Framework, tooling and test infrastructure are things this plan
proposes (§6, §9), not things found.

Because nothing is deployed, merging phases into `main` carries no production
risk until a Vercel project is created at launch.


## 2. The product as it exists

Everything in this section was read from source, not inferred from the mock.

### 2.1 Shape

- A vanilla web component, `<theme-forseen>`, with an open shadow root. No
  framework. One runtime dependency (`color-namer`, used for searching themes
  by color name). Built with esbuild, covered by about 40 Playwright tests.
- Importing the package appends the element to `<body>` by itself and guards
  against duplicates.
- **The tab** is fixed to the right edge, vertically centered, 48 x 120 px,
  with a palette icon and the word THEME. It is a shimmering purple gradient.
  It jiggles once after seven seconds and hides while the drawer is open.
- **The drawer** is fixed, full viewport height, at most 90vw wide, and slides
  in from the right. A transparent backdrop closes it on click. Its header
  carries the *old* logo and the name.
- **Two columns of 300 px**: Color Themes and Font Pairings. Each collapses to
  a 40 px vertical strip and remembers its state. At 768 px and below they
  behave as an accordion.
- State lives in private fields and is persisted to `localStorage` under 21
  `themeforseen-*` keys.
- **There is no public API.** No attributes, no methods, no outbound events,
  no CSS custom properties and no `::part` hooks.

### 2.2 Theme model

```ts
interface ColorTheme {
  name: string;
  tags?: string[];
  light: Palette;
  dark: Palette;
}
interface Palette {
  primary; primaryShadow; accent; accentShadow;
  background; cardBackground; text; extra;      // eight colors
  h1Color; h2Color; h3Color;                    // each 'primary' | 'accent' | 'text'
}
```

- Five swatches are shown per theme: Primary, Accent, Background, Card
  Background, Text. The shadow pair and `extra` are underlying roles.
- Headings do not have their own colors; each heading level points at one of
  three roles.
- The data is a static TypeScript array in `src/themes.ts` (63,000 lines)
  compiled into the bundle. Adding themes means editing that file and
  releasing.
- **2,054 themes** in this checkout (1,966 distinct names), all tagged, across
  **643 distinct tags**.
- A selection is applied as inline custom properties on `<html>`:

  ```
  --color-primary   --color-primary-shadow   --color-accent   --color-accent-shadow
  --color-bg        --color-card-bg          --color-text     --color-extra
  --color-h1  --color-h2  --color-h3  --color-heading
  --primary-color  --secondary-color  --background-color  --foreground-color   (aliases)
  color-scheme: light | dark
  ```

### 2.3 Font pairings

```ts
interface FontPairing {
  name: string;            // "Inter & Geist"
  heading: string;  headingStyle: string[];
  body: string;     bodyStyle: string[];
}
```

- **197 pairings, 196 distinct fonts**: 122 served by Google Fonts, 74 by
  cdnfonts.com. Only weights 400 to 700 are requested.
- Heading and body can be chosen independently: click either name inside any
  pairing, or swap them.
- The filter offers Sans, Serif, Display and Mono, separately for heading and
  body. The data carries 31 heading styles (display, sans, serif, corny, slab,
  handwriting and more), so most are unreachable from the filter. Every body
  font is tagged `sans`, which makes the body filter inert.
- There is no font search.
- Applied as `--font-heading` and `--font-body` (plus two aliases), each with a
  fallback stack.
- On connect the widget requests a stylesheet for every listed font, roughly
  196 requests, before the drawer has been opened.

### 2.4 Light and dark

- The light and dark selections are independent indices. Stars (one per mode)
  and hearts (many per mode) are independent too.
- Mode comes from storage, otherwise from `prefers-color-scheme`.
- Two inbound hooks exist: a `darkmode-change` event on `window` carrying
  `detail.dark`, and an observer watching `color-scheme` on `<html>`.
- `applyTheme()` returns early when the drawer is closed unless forced. An
  external mode change while the drawer is closed updates the widget's state
  but does not repaint the page.
- With nothing stored, the widget force-applies theme 0, "Electric Sunset"
  (hot pink and yellow on white), on first load.

### 2.5 Export and apply

- Each theme and pairing has a lightning button.
- It first tries `POST http://localhost:3847/api/apply` with a one second
  timeout. That server is `npx theme-forseen`, run in the user's project. It
  detects Next.js, Vite, Astro, SvelteKit, Nuxt, Remix or plain HTML, finds
  the stylesheet, and writes a marked block that later writes replace.
- With no server running it falls back to a modal with a snippet, a Copy
  button, and Save to File (File System Access API, so Chromium only).
- The theme snippet is a Tailwind v3 style JavaScript config. The font snippet
  is CSS.
- **Not in the product:** `theme.json`, a Tailwind v4 `@theme` export, export
  of both modes at once, export of heading colors.
- Two defects noticed in passing: applying a font through the server writes
  only `--font-family` with the heading font, and the CLI reports version
  1.0.0.

### 2.6 Weight

| | minified | gzip | brotli |
|---|---|---|---|
| Whole widget, without `color-namer` | 1,080 KB | 181 KB | 126 KB |
| Theme and font data alone | 1,010 KB | 164 KB | 112 KB |

93% of the widget is data.


## 3. Where the mock and the product disagree

Product behavior follows the source. Composition follows the mock.

| # | The mock or brief shows | The source says | Resolution |
|---|---|---|---|
| 1 | A redesigned drawer: two large tabs, search in both columns, All / Starred / Liked pills, Styles and Moods menus, a Light/Dark switch, Preview on This Site and Apply to Project buttons | Two collapsible columns, one combined search and tag menu, Light Mode / Dark Mode buttons, a lightning button per item | The mock is the widget's next design. Site first, widget after (§5). No imitation drawer is built in the meantime |
| 2 | The drawer docked inside the console, starting under the header | A fixed overlay, full viewport height, 600 px wide plus chrome | The console gets a real drawer bay. Docking arrives with the widget work |
| 3 | No tab visible; the drawer is simply open | The tab is the entry point | The canonical screenshot is the state after the click. Default state is decision D6 |
| 4 | Ten theme names | Three exist (Golden Hour, Forest Floor, Concrete). Golden Hour's real colors are orange on near-white, not the mock's swatches | Show real data only |
| 5 | "Hundreds of themes" | 2,054 | Derive the copy from the package at build time |
| 6 | Ten font pairings, written "A + B", each with a one-line description | Eight of the ten are absent; four are commercial faces the loader cannot fetch. Names use "&". No descriptions exist | Show real data only |
| 7 | Starred and Liked | The star is titled Like and allows one; the heart is titled Love and allows many | Follow the source's terms until the widget changes them |
| 8 | v1's code panel: `--color-background`, `--color-card`, tabs for Tailwind and theme.json | `--color-bg`, `--color-card-bg`; no theme.json | Any code shown on the page is the real generator's output |
| 9 | "Apply it to your code in one click" | True only while `npx theme-forseen` is running; otherwise copy or save | Keep the line, state the requirement near the APPLY step |
| 10 | CRT readouts: Clarity 87%, Contrast 76%, Harmony 82%, FAVORABLE | Nothing of the kind is computed | Replace with true figures: collection counts and live state (§6.4) |
| 11 | CRT says Newsreader + Inter while the headline is a heavy grotesque | The headline follows `--font-heading` | The default pairing must have a grotesque heading; the CRT reports the truth |
| 12 | A Light/Dark switch only inside the drawer | The brief requires a physical DAY/NIGHT control on the machine | Added to the CRT label strip (D4). A small, deliberate addition to the mock |
| 13 | Six navigation labels | A clean start has one page | Decision D2 |
| 14 | Three numbered steps beneath two browser windows; APPLY has no visual | | Follow v2 as drawn |
| 15 | No copyright line, no link to mm.coffee | | A manufacturer's data plate beneath the console (§6.6) |
| 16 | The striped cloud has hollow, colored drips | The logo sheet draws solid drips | The sheet wins (D5) |
| 17 | The drawer header shows the cloud | The widget ships the old eye logo | Fixed in the widget work |
| 18 | | The tab is a purple gradient, which the brief rules out | Fixed in the widget work |

### Risks

1. **The drawer is 31% of the canonical composition and cannot be matched
   until the widget is redesigned.** Convergence passes before then compare
   everything except the bay's interior.
2. **Loading the widget is expensive today**: 126 KB of brotli and about 196
   font stylesheet requests at connect. It must be loaded lazily until the
   widget itself is fixed.
3. **The widget repaints the page with "Electric Sunset" on a first visit.**
   The station needs a default theme that really exists in the product (D3).
4. **2,054 themes were not designed for this machine.** Some will make poor
   chassis colors. The structural system in §6.3 exists so the machine stays
   legible anyway, and it needs testing against deliberately hostile palettes.
5. **The mock is generated concept art.** Its small text, cloud, and some
   alignments are approximate. Where it contradicts itself the plan says which
   reading is followed.


## 4. Canonical geometry

Measured from `homepage-v2.png` at 1536 x 1024 by detecting long seams.

| Region | x | y | size | share of chassis |
|---|---|---|---|---|
| Field around the machine | | | 12 to 17 px margin, `#022327` | |
| Chassis | 12 to 1522 | 14 to 1007 | 1510 x 993 | |
| Header band | 12 to 1522 | 14 to 97 | 1510 x 83 | 8.4% of height |
| Brand block, taller than the band | 12 to 452 | 14 to 133 | 440 x 119 | |
| Hero panel | 12 to 452 | 133 to 641 | 440 x 508 | 29.1% of width |
| CRT module | 452 to 1048 | 97 to 641 | 596 x 544 | 39.5% of width |
| CRT label strip | 475 to 1026 | 103 to 131 | 551 x 28 | |
| CRT faceplate | 465 to 1035 | 135 to 591 | 570 x 456 | |
| CRT rim | 479 to 1021.5 | 142 to 574.5 | 542.5 x 432.5 | |
| CRT aperture | 490 to 1010.5 | 155 to 568.5 | 520.5 x 413.5 | 1.26 : 1 |
| CRT glass | 500.5 to 999 | 163 to 563 | 498.5 x 400 | |
| Drawer bay | 1048 to 1522 | 97 to 968 | 474 x 871 | 31.4% of width |
| Demo row | 12 to 1048 | 641 to 932 | 1036 x 291 | |
| Equipment strip | 12 to 1048 | 932 to 1007 | 1036 x 75 | |
| Strip beneath the bay | 1048 to 1522 | 968 to 1007 | 474 x 39 | |

```
+-----------------------------------------------------------------------+
| brand block      | nav                      [Get Started] | station   |  header
|                  +------------------------------+---------+-----------+
+------------------+  THEME CONDITIONS            |                     |
| TF-01            | +--------------------------+ |                     |
|                  | |                          | |                     |
| See              | |          CRT             | |     drawer bay      |
| what             | |                          | |                     |
| fits.            | +--------------------------+ |                     |
+------------------+------------------------------+                     |
|  1 EXPLORE          2 PREVIEW          3 APPLY  |                     |
+-------------------------------------------------+                     |
|  stack | photo | same site | vents and mark     +---------------------+
+-------------------------------------------------+---------------------+
      29%                 39.5%                            31.5%
```

Points worth holding on to:

- The header is L-shaped. The brand block is 36 px taller than the rest, and
  the cloud hangs over the seam into the hero panel.
- The CRT module and the drawer bay both start at y = 97, directly under the
  header. The hero panel starts lower, at 133.
- x = 1048 is the strongest vertical line on the page: the bay's left edge,
  the end of the demo row and the end of the equipment strip.
- The left text edge (x near 48) is shared by the logo, the hero copy, the
  first demo window and the equipment strip.

Hero type, measured: headline about 111 px with a 79 px line pitch (a line
height of 0.71) and tight tracking; paragraph about 19 px on 21.5 px; buttons
41 px tall; mono labels about 12 px, letterspaced.

### Responsive boundaries

| Width | Composition |
|---|---|
| 1280 and up | The three-column console. Proportional between 1280 and 1680, capped at 1680 and centered |
| 768 to 1279 | Modules reflow: hero beside the CRT from 1024, stacked below it |
| under 768 | A vertical stack of instrument modules |


## 5. Running the real widget on the site

### 5.1 What the site consumes

Tailwind 4's theme variables share the widget's names, so the mapping the
widget's own README prescribes is the whole integration:

```css
@theme inline {
  --color-primary: var(--color-primary);
  --color-bg: var(--color-bg);
  /* ... the eight colors, --font-heading, --font-body */
}
```

`bg-bg`, `text-text`, `bg-primary` and `font-heading` then follow whatever the
drawer selects, with no JavaScript in between. The site declares the same
variables in its stylesheet as defaults, so it is fully styled before the
widget loads and without it.

### 5.2 One adapter

A single module, `src/scripts/conditions.ts`, is the only code that knows how
the widget stores its state. Everything else listens to it.

```
widget  -->  <html style>, localStorage  -->  conditions.ts  -->  "conditions:change"
                                                                     |-- CRT readout
                                                                     |-- cloud stripes
                                                                     |-- DAY/NIGHT switch
                                                                     `-- on-color contrast tokens
DAY/NIGHT switch  -->  conditions.ts  -->  "darkmode-change"  -->  widget
```

Names for the readout come from the package's own exported arrays, indexed by
the stored selection. Nothing is copied into the site.

When the widget gains a real event API, only this file changes.

### 5.3 What the widget needs, and when

The widget work has two parts. They are separable, and only the first affects
the site's schedule.

**Plumbing** (no visual change, covered by the existing tests):

- a `themeforseen:change` event and readable state
- `open()` and `close()`, and an `open` attribute
- repaint on external mode changes while closed
- a default theme that can be named rather than always index 0
- load font stylesheets as items scroll into view
- load the data separately from the code
- ship a station default theme in the data (D3)

**New look** (the mock's drawer):

- the layout in discrepancy 1, the cloud in the header, a tab that belongs to
  the machine
- a docked mode so the drawer can sit in the bay
- styling hooks so a host can skin it

Recommendation: do the **plumbing at milestone 4**, because without it the
site needs four workarounds that would be written only to be deleted. Do the
**new look after the site is built**, as you asked.

If you would rather not touch the widget at all until the site is finished,
milestone 4 can proceed against 0.5.0 unmodified. The workarounds are listed
under that milestone.

### 5.4 The drawer bay

The bay is part of the chassis: a recessed slot the drawer slides into. With
the drawer closed it reads as an empty bay with rails, a label and the tab.
The mock only shows the open state, so the closed bay is a designed extension
and will be shown to you for approval at milestone 1.

Until the widget can dock, the drawer opens over the page as it does on any
site, and the bay stays a bay.

**The bay while empty** (added 2026-09-30). A recess, two rails and a plate
are a placeholder, not a design. At milestone 6 the bay's interior gets the
same hardware treatment as the rest of the chassis, so that with the drawer
out it still reads as part of the machine: the rails as real guides, an edge
connector or ribbon at the back, a service label, ventilation, and the
plate's key. It stays visually quiet; nothing in it should compete with the
drawer once the drawer is there. How much of it is ever seen depends on D6.

Built at milestone 6: steel rails top and bottom, an edge connector with gilt
contacts at the back, a paper service label, a deeper shadow into the
recess, and a lamp on the plate that lights while the drawer is out. No
vents: the bay was quieter without them.


### 5.5 Milestone 4: where it stands

Written 2026-09-29, before any code. Branch `m4-widget` exists in this
repository and is empty. The widget's repository is clean on `main` at 0.5.0,
which is also what npm has; it has no `node_modules`, so `pnpm install` comes
first there. Its 33 Playwright tests are the baseline.

**What reading the widget turned up**

- On first load it paints theme 0, "Electric Sunset", and pairing 0 over the
  page, whatever the page's own stylesheet says. Included as it is, it would
  turn this site pink on white.
- `renderFonts()` runs when the element connects and requests a stylesheet
  for every font in every pairing: about 390 requests to Google Fonts and
  CDNFonts on page load, with the drawer closed.
- `class ThemeForseen extends HTMLElement` is evaluated when the package is
  imported, so importing `theme-forseen` in Astro frontmatter throws. The
  counts on the CRT need the data without the element.
- `applyTheme()` returns early while the drawer is closed, so a
  `darkmode-change` from the page does nothing until it is opened. The README
  does not document that event.
- Selections are stored as indexes into the arrays. New entries go at the
  end, or every existing user's selection moves.
- No pairing has Geist as its heading face. Index 0 is Inter over Geist, the
  reverse of this site.
- Applying a pairing requests its faces from Google at weights 400 to 700.
  This site's own files carry the same family names, so the hero's 900 still
  comes from here.

**The widget release this needs: 0.6.0**

| | Change | Size |
|---|---|---|
| 1 | A `themeforseen:change` event, bubbling and composed, and a `state` getter: mode, theme name and colors, heading and body faces, open or closed | Small |
| 2 | `open()`, `close()`, `toggle()`, and an `open` attribute kept in step | Small |
| 3 | Repaint when the mode is changed from outside while closed | Tiny |
| 4 | `default-theme` and `default-fonts` attributes, by name, used when nothing is stored | Small |
| 5 | Request a font's stylesheet when its row scrolls into view, and only while open | Small |
| 6 | The data as its own entry, `theme-forseen/data`, through an `exports` map; the element loads it on demand | Medium, and the one to weigh |
| 7 | The station's theme, light and dark, and a Geist over Inter pairing, both appended | Small |

**Open, and Mark's to decide**

How the site gets 0.6.0. Publishing to npm is his to do. Until then the site
can depend on the widget's commit on GitHub, which needs the branch pushed
and, under pnpm 10, the package allowed to run its build
(`onlyBuiltDependencies`). A local `file:` link would work on this machine
and fail in CI and on Vercel.

**On this site, once the widget is ready**

1. `<theme-forseen default-theme default-fonts>` in the layout, its script
   loaded when the page is idle.
2. `src/scripts/conditions.ts`, the adapter in §5.2. It also keeps the last
   applied variables and restores them in `<head>`, so a returning visitor
   does not see the factory colors first.
3. The DAY/NIGHT switch at the right end of the CRT label strip (D4).
4. The CRT's readouts: palette, type, mode, ACTIVE or STANDBY, and the three
   counts, read from `theme-forseen/data` at build time.
5. The bay's plate opens the drawer.

Night's chassis colors are designed with the station theme in item 7. How
structure and wear answer to them is milestone 5.

#### As built

**The widget.** All seven changes are in
[theme-forseen#24](https://github.com/mark-mcdermott/theme-forseen/pull/24),
version 0.6.0, with 27 new tests beside the existing 33. Published to npm on
2026-09-30; the site depends on `^0.6.0`. Until then it depended on the
branch's commit, which needed the package allowed to build on install under
pnpm 10. `RELEASING.md` in the widget's repository has the steps to publish.

| | 0.5.0 | 0.6.0 |
|---|---|---|
| Font stylesheets requested at page load, drawer closed | about 390 | 2 |
| Element's code, as shipped | 1.9 MB with the data | 373 KB |
| Collection | in the same file | 1.4 MB, fetched separately |

The station's theme is "Weather Station", at the end of the collection. Day is
the mock's cream, ink, orange and teal. Night is a warm charcoal chassis
(`#2B2722`) with the day's cream as its ink, so the machine stands apart from
the teal field behind it by hue rather than by lightness. The pairing is
"Geist & Inter".

**The site.**

| Piece | Where | Notes |
|---|---|---|
| What the package says | `src/lib/product.ts` | Read at build: version, the three counts, the factory theme's colors. The theme's colors are no longer written in `tokens.css` |
| The adapter | `src/scripts/conditions.ts` | Listens for `themeforseen:change`, publishes `conditions:change`, remembers the conditions, fetches the widget when the page is idle |
| Restoring | `src/layouts/Base.astro` | One inline script in `<head>` puts back the remembered inline style before the first paint |
| DAY/NIGHT | `src/components/ui/DayNightSwitch.astro` | Two radio legends and the slot between them. The knob's position follows `--night`, which is on the page before any script runs |
| Readouts | `src/components/crt/CrtScreen.astro` | Set at the reference's positions. The map, clock, cloud and glow are milestone 7 |
| The bay | `src/components/console/DrawerBay.astro` | A key on the plate opens the drawer |

`--night` is 0 by day and 1 by night, for anything that has to answer to the
mode in CSS: the switch now, wear and glow later.

**Judgment calls, for review**

- **A first visit follows the visitor's system.** With nothing stored the
  widget takes its mode from `prefers-color-scheme`, as it does on any site,
  so a visitor whose system is dark meets the station by night. The factory
  styles carry both palettes so that this is true from the first paint.
- **SIGNAL means the widget has reported in.** Its four lamps are dim until
  then and lit afterwards.
- **Readings are set in Inter and in their own case**, as the reference sets
  them, whatever pairing is selected. The tube is an instrument, not part of
  the page being themed.
- **The key, not the whole plate, opens the drawer.** A plate that is one large
  button would read out its entire legend as the button's name.

**Known, and left for later**

- The widget asks Google for Geist and Inter at weights 400 to 700 although
  this site serves both itself. Proposed for the widget: skip a family the
  page already declares.
- The tab is the widget's own, purple. Milestone W.
- Text on `primary` and `accent` is not yet chosen by contrast, the cloud's
  bands do not follow the palette, and the demo windows keep their own
  colors. Milestone 5.
- Importing `theme-forseen` during server rendering still throws. The site
  imports it only in the browser, and `theme-forseen/data` at build.

**Found along the way**

The widget's repository was private. The site's navigation, both GitHub
buttons and the npm page all link to it, so visitors would have met a 404, and
until 0.6.0 was on npm this also kept CI from installing it. Both repositories
were made public on 2026-09-30, the day the site went live.


## 6. Construction

### 6.1 Stack

| | | |
|---|---|---|
| Framework | Astro, static output | Zero JavaScript unless asked for |
| Styling | Tailwind CSS 4, configured in CSS | Its variable names already match the widget's |
| Language | TypeScript, strict | |
| Interactivity | Vanilla scripts and custom elements | The same way the product is built |
| Packages | pnpm | |
| Hosting | Vercel, static | |
| Tests | Playwright, `astro check` | Browsers are already cached on this machine |

**shadcn: recommended against** (D1). The interface is bespoke hardware; there
is nothing in it a component library would supply, and the brief warns about
exactly the composition such libraries produce. Leaving it out also leaves out
React, so the page ships no framework runtime. The interactive pieces are a
switch, a mobile menu and the adapter.

### 6.2 What is built from what

| Element | HTML/CSS | SVG | Raster | Procedural |
|---|---|---|---|---|
| Chassis, panel grid, seams, bevels | yes | | | |
| Type, labels, buttons, nav | yes | | | |
| Screws, vents, dot grids, lamps | yes (gradients) | | | |
| Cloud, every variant | | yes | | |
| CRT faceplate and recess | yes | | | |
| CRT bezel and aperture | | yes | | |
| CRT glass, vignette, scanlines, glow | yes | | | |
| CRT noise | | | | yes (turbulence) |
| CRT map, isobars, fronts | | yes | | |
| CRT readouts | yes (real text) | | | |
| DAY/NIGHT switch | yes | knob if needed | | |
| Demo browser windows | yes | | photos | |
| Equipment strip photo | | | photo | |
| Surface wear | | | later, if needed | yes, first |
| Framework icons | | yes (Simple Icons) | | |

No giant background image anywhere.

### 6.3 Materials: three separate systems

**A. Surface color** is the theme. Chassis is `--color-bg`, raised panels are
`--color-card-bg`, ink is `--color-text`, controls are `--color-primary` and
`--color-accent`.

**B. Structure** is derived from A, so it survives any palette:

```css
--seam:      color-mix(in oklab, var(--color-text) 42%, var(--color-bg));
--edge-hi:   color-mix(in oklab, white 60%, var(--color-bg));
--edge-lo:   color-mix(in oklab, black 30%, var(--color-bg));
--label-ink: color-mix(in oklab, var(--color-text) 82%, var(--color-bg));
--recess:    color-mix(in oklab, black 72%, var(--color-bg));
```

Because each value is a mixture of the current ink and surface, a seam is
always darker than a light chassis and always distinguishable on a dark one.
Text drawn on `primary` or `accent` gets its color from the adapter, which
picks black or white by measured contrast. Focus rings use `--color-text`.

**C. Wear** is grayscale and transparent, in two layers that behave
oppositely: dark grime multiplied over the surface, light scuffs screened
over it. Their strengths follow `color-scheme`. On a dark chassis the grime
fades and the scuffs show; on a light one the reverse. Neither is corrected
for contrast. It starts procedural and becomes raster only if that falls
short.

Hardware that never changes: CRT black, screw metal, shadow depth, the
manufacturer's marks.

#### Wear, as built at milestone 6

Two transparent layers over every plate, in `src/styles/materials.css`, both
procedural. Grime is multiplied in: a sparse grain of dark specks from an
SVG turbulence tile, most of which is transparent, and stains gathering at
the corners and along the lower edge. Scuffs are screened on: the same grain
in light, and patches of paint worn thin at the corners, along the top edge
and around the fixings. Their strengths follow `--night`: by night the grime
lets go and the scuffs come forward. Each plate's layers are shifted by a
seed from its region name, so no two plates wear alike.

The first grain was too strong: its darkest specks counted as ink to the
lettering probes and stretched the tagline's box. Wear that the comparison
can see is wear that is too heavy.

**D. The field** (added 2026-09-30). The machine's height is its width over
1.52, so on a tall window there is field beneath it: about 300 px on a
2560 x 1440 display, more on a tall window on a larger one. At the moment that
field is flat colour, so it reads as empty page rather than as the wall the
unit is mounted on. Milestone 6 makes it a surface: the chassis casts a soft
shadow on it, and it carries a faint vignette and grain of its own. With the
data plate beneath the console (§6.6) the page then has a bottom. Whether the
machine should also sit centred in a taller window is a composition question
to try and look at, not to decide on paper.

Built at milestone 6: the field carries a vignette and a faint grain, the
chassis casts a soft shadow onto it and has a rolled lip along its edges, and
the data plate sits beneath. The machine is centred in a window taller than
itself and top-aligned in one that is not; the canonical capture is
unchanged, and a test holds the tall composition.

Acceptance for this system is a contact sheet: the console rendered under
twelve deliberately different themes in both modes, every seam and label
still readable.

#### As built at milestone 5

**Structure is the chassis colour moved a fixed distance in lightness**, in
CSS, with relative colour syntax, so it holds from the first paint and needs
no script:

```css
--seam:    oklch(from var(--color-bg) calc(l - 0.3 * sign(l - 0.55)) calc(c * 0.7) h);
--edge-hi: oklch(from var(--color-bg) calc(l + 0.13) calc(c * 0.8) h);
--edge-lo: oklch(from var(--color-bg) calc(l - 0.13) calc(c * 0.8) h);
--recess:  oklch(from var(--color-bg) calc(l * 0.3) calc(c * 0.5) h);
```

The seam goes darker on a light chassis and lighter on a dark one, always by
0.3; the milestone-1 mix of ink and surface vanished wherever a theme's ink
and surface were close. Labels alone still follow the ink, softened to 82%
as the reference sets them, because lettering contrast is the theme's to
choose.

**Lettering on a coloured surface is black or white**, chosen in CSS by the
surface's lightness: `oklch(from var(--color-primary) calc((0.7 - l) * 1e6) 0 h)`
throws the lightness far past 0 or 1 and lets the clamp decide. White wins
below a lightness of 0.7, which is where the eye prefers it, a little before
the WCAG 2 arithmetic does; the reference's white on orange is the case in
point. `--on-primary`, `--on-accent` and `--on-extra`.

**The measure is lightness, not a WCAG ratio.** A step of 0.3 in OKLCH
lightness next to black is 1.55:1 by the WCAG formula and plainly visible to
the eye; the formula's flare term flattens everything near black. The test
holds seams to a lightness distance of 0.25 and edges to 0.1.

**The twelve themes** are chosen by measurement, in
`scripts/pick-contact-sheet.ts`, and recorded in
`design/reference/contact-sheet.json`: the factory theme, the old first-visit
theme, the darkest light-mode chassis, the lightest dark-mode one, a chassis
of middling lightness where the seam has to choose a side, the least ink
contrast, the most vivid primary, no colour at all, a primary equal to the
chassis, an accent equal to the ink, the palest primary and accent, and a
primary and accent that are opposites. `pnpm contact-sheet` renders the
twenty-four to `compare/contact-sheet.png`; `tests/materials.spec.ts`
measures them, 24 tests.

Seen on the sheet and left for milestone 6: where the primary equals the
chassis, the primary key is read only by its lettering. A key wants an edge
of its own, which is the bevel work.

### 6.4 The CRT

Seven nested layers, outermost first:

1. **Chassis cutout**: HTML and CSS, an inset shadow into the panel.
2. **Label strip**: HTML, a black recessed bar with its own screws.
3. **Faceplate**: HTML and CSS, near-black with a 16 px radius and four
   screws.
4. **Bezel**: SVG. Two closed paths, outer and aperture, with gradient fills
   for the chamfer.
5. **Recess**: CSS shadow inside the aperture.
6. **Glass**: CSS. A radial vignette, a soft highlight along the top edge, a
   faint reflection.
7. **Screen**: HTML text and an inline SVG map, clipped to the aperture.

The aperture is **an SVG path, not a border radius**. Each side is a single
cubic Bezier that bows outward, meeting its neighbors in a tight corner arc,
which is how a tube face reads. The same path is used twice: drawn, as the
bezel's inner edge, and as a `clipPath` in object bounding box units, to clip
the screen. One definition, so the two can never drift, and it scales with
the module. The control points are tuned against the reference with the
overlay until the silhouette matches along its whole perimeter.

CSS alone cannot bow a straight edge, and an SVG alone would make the screen
content an image. The combination keeps the silhouette exact and the readouts
real, selectable, accessible text.

#### As built at milestone 3

The reference turned out to have four outlines, not two, and the bezel is a
funnel rather than a chamfer. From the outside in:

| Outline | What it is | Bow: top, side, bottom | Corner radius: top, bottom |
|---|---|---|---|
| Rim | The faceplate turning down into the funnel; a thin line, brightest along the bottom | 6, 1.5, 2.5 | 27.5, 27.5 |
| Aperture | The funnel ending and the black recess beginning | 12.5, 10, 12 | 35, 38 |
| Lip | The tube's own edge, a faint lit line inside the recess | 12, 10, 12 | 35.5, 35.5 |
| Glass | The face of the tube coming out of the recess's shadow | 12, 8.5, 11.5 | 34, 38 |

All four are one construction, in `src/lib/crt.ts`: a rectangle whose sides
are parabolas standing out by the bow, joined by corners whose handles reach
0.62 of the radius, a little squarer than a circle's 0.55. Eight cubics each.
The numbers were fitted by least squares to outlines traced from the
reference, then rounded to half a pixel.

- **Surfaces are HTML**, each cut by its outline as a `clipPath` in object
  bounding box units: funnel, recess, tube. The screen is a slot inside the
  tube, so milestone 7 puts real text there.
- **The funnel's four faces are one conic gradient** about the tube's centre:
  the top in shadow, the sides dimming downward, the bottom lit, a sheen on
  each lower diagonal. Its stops are colours sampled from the reference.
- **Lines, shadow and glare are one SVG** laid over the surfaces, drawing the
  same four paths. The bezel's shadow on the glass is a wide blurred stroke of
  the glass outline, so it follows the bow instead of the bounding box.

The tracing is reproducible: `pnpm trace` reads the reference along 360 rays
from the tube's centre and writes `design/reference/crt-contours.json`. It
reads each ray twice, once for lit edges and once for the upper corners where
the funnel is nearly as dark as the recess, and drops any reading that jumps
away from its neighbours or stands off the curve they describe. What is left
covers 242 to 330 of the 360 degrees, depending on the outline. The gaps are
where the reference itself is unreadable: mostly the rim's upper corners, where
its line fades into the faceplate.

Screen content, all of it true:

```
THEMEFORSEEN                          MON SEP 29 2026
VISUAL EXPLORATION SYSTEM                     9:42 AM
AUSTIN, TX

CURRENT CONDITIONS
PALETTE     <active theme name>
TYPE        <heading> + <body>
MODE        DAY | NIGHT
SIGNAL      * * * *

EXPLORATION
ACTIVE | STANDBY            THEMES      2,054
                            PAIRINGS      197
                            TAGS          643
GOOD DESIGN AHEAD.                      TF-01
```

The three percentages in the mock become the three collection counts, read
from the package. FAVORABLE becomes ACTIVE while the drawer is open and
STANDBY otherwise. The clock is station time, America/Chicago.

Text inside the tube is sized in container units of the screen, so the
picture scales with the tube like a picture. Below a certain tube width the
secondary readouts drop out rather than shrink.

Treatment: scanlines from a repeating gradient, phosphor glow from text
shadow, noise from turbulence stepped a few times a second, a slow drift in
the isobars, a flicker under 2%. All of it stops under
`prefers-reduced-motion`. The phosphor is fixed teal, tinted slightly toward
the active accent.

#### As built at milestone 7

- **The map** is Natural Earth's 1:110m states and countries, public domain,
  projected with the USGS Albers conic for the contiguous states, simplified
  and committed as `src/assets/map/contiguous-us.json` (16 KB, 49 paths and
  the nation's outline). `pnpm make-map` remakes it from the source. It sits
  where the reference puts it: the west coast a little right of the screen's
  centre, the east running off the glass.
- **The weather** is `src/lib/synoptic.ts`: a high and a low with isobars
  round each, circles whose radius breathes with two slow harmonics, and a
  warm front on two cubic curves with semicircles spaced along it at build,
  their domes standing off its western side. Three station dots. None of it
  is a forecast.
- **The clock** is station time, `America/Chicago`, updated on the minute;
  dashes until the script runs, so a visitor without it is never shown the
  build's time as now.
- **The cloud on the tube** carries the palette's bands with its outline in
  phosphor, rather than the outline alone that §6.5 planned: the reference
  draws it striped, the front is already in colour, and the tube is allowed
  its theme-aware accents. The front borrows a little of the primary.
- **The glass:** scanlines multiplied over everything, a screened grain
  stepped three times a second, glow from text-shadow and a drop shadow on
  the chart, and a flicker that never drops below 98%. The isobars drift over
  110 seconds and the front sways over 140, both barely. Under
  `prefers-reduced-motion` every animation is off and `document.getAnimations()`
  is empty; a test holds that.

### 6.5 The adaptive cloud

Geometry comes from `design/brand/logo.svg`, which is your file with its path
data untouched. It is one compound path: the outer silhouette and the inner
counter.

```svg
<svg viewBox="0 0 288.46 296.29">
  <clipPath id="counter"><path d="...inner subpath..."/></clipPath>
  <g clip-path="url(#counter)">
    <rect style="fill: var(--cloud-1)" .../>   <!-- five bands -->
  </g>
  <path fill="var(--cloud-ink)" fill-rule="evenodd" d="...both subpaths..."/>
</svg>
```

| Variant | Where | How |
|---|---|---|
| Adaptive | header brand | bands from the active palette, outline in ink |
| Monochrome | data plate, README, one-color uses | `logo.svg`, `currentColor` |
| Filled | small marks, favicons from 24 px | `logo-filled.svg`, the outer subpath alone |
| Embossed | the equipment strip badge | filled, drawn with highlight and shadow only |
| Phosphor | the CRT | bands from the palette, outline in phosphor, with glow (built so at milestone 7) |
| Micro | 16 px | redrawn on the pixel grid from your tuned 16 px file, drips spaced wider |

Band colors are chosen by the adapter, not mapped role by role. It takes the
palette's chromatic colors, drops any too close to the ink or to each other,
orders them cool and dark at the top to warm and light at the bottom, and
sets `--cloud-1` through `--cloud-5`. Fills transition over 400 ms.

#### As built at milestone 5

`src/lib/cloud-bands.ts`, run at build for the factory theme and by the
adapter on every change, so the two agree and a returning visitor's bands are
restored with everything else.

- The anchors are the palette's three chromatic roles, accent, primary and
  extra; a grey one, or one that repeats another, is left out. Sorted dark to
  light they make a path through OKLCH, and the bands are five stops along
  it: the anchors and the colours halfway between them. The factory
  palette's teal, orange and amber give teal, green, orange, orange, amber:
  the brand's stripes, from colours that are really in the theme.
- Between two anchors the hue turns the short way, unless they are near
  opposites, when either way is as short: then it turns through the other
  anchors' hues if it can, otherwise through green, which is the way the
  brand's stripes go. Teal and orange are near opposites, and the first
  attempt went through purple.
- Every band keeps 0.22 in lightness clear of the ink, on the side that has
  room, and 0.04 from the band above it, so none can vanish into the outline
  or into its neighbour. A palette with one colour gets a ramp of it; one
  with none gets greys.

### 6.5b Hardware, as built at milestone 6

- **Plates.** Every panel is a plate set into the chassis: a groove 5 px in
  from its edge, its own edge lit along the top and left and shadowed along
  the bottom and right, corners rounded only where two edges meet. A side
  where a plate runs on into its neighbour has no edge: the brand block and
  the header band are one L-shaped plate, as the reference draws them. The
  milestone-1 boundary seams are gone; the grooves are the seams now.
- **Screws.** Pan-head steel, lit from the upper left, at the corners the
  reference puts them: most plates, not all. Black oxide ones on the CRT's
  label strip.
- **Holes and slots.** The two drilled grids in the header and the vents
  either side of the badge, all gradients.
- **Keys.** Lit along the top, shadowed along the bottom, standing a little
  off the plate, pressed flat on `:active`. A key now has an edge of its own
  where the primary equals the chassis.
- **Lamps.** A domed lens in a bezel, lit or not, used on the bay's plate.
- Under the twelve hostile themes the plates, screws and keys stay legible
  on black, white, grey and saturated chassis alike, because their edges are
  the structural tokens of milestone 5.

### 6.6 Components

```
ConsoleShell          the chassis, the grid, the field behind it
  Panel               surface, seams, optional screws and label
  PanelLabel          stencilled mono caption
  Screw  Vent  DotGrid  Lamp
  HardwareButton      the primary and secondary buttons
  DayNightSwitch      custom element
  StationPlate        location, coordinates, version
  DataPlate           maker, year, link to mm.coffee
  DrawerBay
  Crt
    CrtHousing        strip, faceplate, bezel, glass
    CrtScreen         readouts, map, overlays
  CloudLogo           variant = adaptive | mono | filled | embossed | phosphor | micro
  DemoBrowser         mode = light | dark
  StepCaption
  StackStrip
```

Screws, vents and dot grids are pseudo-elements and gradients where that is
simpler than a component. Styles are Tailwind utilities plus three small
layered files: tokens, materials, CRT.

### 6.7 Type

| Role | Follows the theme | Candidates |
|---|---|---|
| Hero headline, demo headlines | yes, `--font-heading` | default must be a heavy grotesque |
| Body copy | yes, `--font-body` | |
| Labels, nav, readouts | no | a grotesque mono |
| Wordmark | no | converted to outlines once chosen |

The headline is set at weight 900. The widget requests up to 700, so a
heading font chosen in the drawer renders at its heaviest available weight.
The default faces are self-hosted so the first paint does not wait on a font
host.

### Faces, as chosen at milestone 2

Each was chosen by setting candidates at the reference's cap height and
measuring how far their line lengths fell from the reference's.

| Role | Face | How it fits |
|---|---|---|
| Headline | **Geist 900**, 112.7 units, tracking -0.0685em | The three lines land within 2 px. Inter at the same cap height runs 5 to 7 px off |
| Body | **Inter 400**, 17.4 units | Within 5 px on every line |
| Lettering | **M PLUS 1 Code** | The reference's mono is about 9% narrower than any standard one. This is the nearest that also has a bold, and it takes positive tracking, which suits a stencilled label |
| Wordmark | **Sofia Sans Extra Condensed 900**, outlined | Matches the mark's width with no tracking at all |
| Night window headline | **EB Garamond 600** | The nearest serif among the 35 the product offers. Its first line runs 7 px short; the reference's serif is not a real face |

The default pairing is therefore Geist over Inter. The product's first pairing
is "Inter & Geist"; the drawer's swap control gives the reverse, so the
station's default is a state the product can really be in.

The demo windows are illustrations. Their colors will follow the theme; the
night window keeps its serif so that it shows a second, different condition.

All faces are self-hosted under their plain family names, so that when the
drawer sets `--font-heading` to a name the site already has, the site's own
file answers, including the 900 weight the drawer does not request.


## 7. Responsive art direction

**Desktop, 1280 and up.** The console as drawn. Dimensions are expressed in a
console unit, one reference pixel at the canonical width, so the machine
holds its proportions from 1280 to 1680 and then stops growing. This is
proportional layout within one composition, not a scaled screenshot: the grid
is a real grid and text remains text.

**Tablet, 768 to 1279.** The bay is dropped, since the drawer overlays the
page as on any site, and replaced by a controls module carrying DAY/NIGHT.
From 1024 the hero sits beside the CRT; below that the CRT takes the full
width above it. The demo windows stay side by side. The equipment strip wraps
to two rows. Navigation folds into a panel behind a hardware button.

**Mobile, under 768.** A stack with a visible seam between every module:

1. manufacturer plate: mark, wordmark, menu
2. hero
3. CRT at full width, secondary readouts removed
4. conditions and controls: DAY/NIGHT, open the drawer
5. what it does
6. Explore, with the light demo window
7. Preview, with the dark demo window
8. Apply
9. stack strip, badge, data plate

Screws and seams remain; dot grids and vents thin out.

### As built at milestone 8

The mechanism: a Tailwind variant, `console:`, is the desktop composition.
Every placement utility that puts a piece at the reference's coordinates
carries it, so below 1280 px those utilities fall away and each module lays
itself out in flow, in its own stylesheet, with the unit a pixel. The two
modules that are pictures, the tube and the demo windows, keep measuring
themselves: each is a container and its parts take their unit from its
width, so a tube half as wide is the same tube half as big.

| Width | Composition |
|---|---|
| 1024 to 1279 | Manufacturer's plate and band; hero beside the tube with the controls module beneath the tube; the two windows side by side, each above its caption, Apply beneath; the stack marks left, the panorama and its line right against the edge, the badge whole on its own row |
| 768 to 1023 | The same, with the tube full width above the hero and the controls beneath the hero |
| under 768 | The stack of §7: plate, hero, tube, controls, Explore with the day window, Preview with the night window, Apply, the marks, the badge, the data plate. The panorama and the tagline are left out; the tube shows the name, the clock and the current conditions, set in a larger unit, and drops the rest |

- The navigation folds behind a hardware key into a panel with the station's
  particulars at its foot: a `<details>`, so it opens without a script. On a
  phone the key is the three bars alone.
- The bay is not a slot below the console, since the drawer opens over the
  page as on any site; it is a controls module, the plate alone.
- Screws and grooves stay on every module. Dot grids and vents go with the
  station plates and the panorama.
- A test at each of the three widths holds that no module's contents exceed
  it, that the navigation folds, that the tube keeps its proportions and that
  the bay is a controls module; another that the phone's windows stack above
  their captions. The 1024 test caught the hero's features running 13 px
  over the plate, which now wrap.

To review the desktop composition with the browser's developer tools open,
undock them into their own window, or the page drops under 1280 px.

### Notes from review, 2026-09-29

Requirements for milestone 8, from Mark's first look at the narrow layouts.

Between 768 and 1279:

- The hero's copy must not run under the module below it.
- The three steps must not run under the equipment strip.
- **Equipment strip:** the stack marks sit on the left. The panorama and
  "Same site. Different conditions." sit on the same line, in the right half,
  aligned to the right edge.
- **The badge stays whole.** The cloud on its own, separated from its
  lettering and vents, looks wrong. Keep the badge together as one object or
  leave it out.

At 790 and below:

- Less space beneath the two demo windows, and less beneath the three steps.


## 8. Assets

### Supplied

| Asset | State |
|---|---|
| `logo.svg` | Clean. One compound path, tight viewBox, no artboard. One stray `id` removed; path data untouched |
| `svg-logo-code.txt` | Byte-identical to `logo.svg` |
| `logo-filled.svg` | Derived by dropping the inner subpath. Matches sheet item 02 |
| Favicon 16 px | 16 x 16. Used as the hand-tuned master |
| Favicon 24 px, 32 px | **24 x 25 and 32 x 33**, one pixel too tall, because the mark is taller than wide and they were exported by width. No empty row to trim. To be re-rendered from the vector, fitted by height and centered |
| `cloud-logo-sheet.png` | In `design/reference` |
| zozo | In `design/brand`. Not on the homepage |
| Mocks v1 and v2 | In `design/reference`, as the original PNGs rather than the WebP attachments |

### Photographs

Supplied 2026-09-29. The PNG masters stay in `branding/images`; the repository
holds WebP copies at the same pixel size, about a tenth of the weight.

| File in `src/assets/photos` | Size | Use |
|---|---|---|
| `joshua-trees.webp` | 2400 x 1600 | light demo window |
| `mountains-overflow.webp` | 2400 x 2159, with alpha | night window, rising out of its frame (D9) |
| `desert-panorama.webp` | 2400 x 960 | equipment strip, rendered monochrome in CSS |

`mountains-overflow` is a 2400 x 1600 photograph with 559 px of cloud and peak
standing above its top edge, over the right-hand 39% of its width. Two defects
in the supplied alpha channel were repaired in the repository copy: the body
was 98% opaque rather than fully opaque, and background removal had left a
faint haze above the frame.

### To be made

| Asset | Form |
|---|---|
| Map of the United States | **Made.** `src/assets/map/contiguous-us.json`, from Natural Earth by `pnpm make-map` |
| Isobars, pressure centers, fronts | **Made.** `src/lib/synoptic.ts` |
| Micro cloud, 16 px filled and outline | SVG on a 16 unit grid |
| Favicon set | **Made.** `pnpm make-icons`: the 16 px from the hand-tuned micro mark, the rest from the vector; a manifest beside them |
| Framework marks | **Made.** SVG from Simple Icons |
| Wear, grain, CRT noise | **Made.** Procedural |
| Social card | **Made.** `pnpm social-card` renders it from the built page: the brand, the hero and the tube at 1200 x 630 |


## 9. Verification

Built in milestone 1 and used at the end of every phase.

- **`pnpm compare`** captures the page at 1536 x 1024 and writes, to an
  ignored folder: the capture beside the reference, a 50% blend, a difference
  map, an edge report giving the position of every major edge next to the
  table in §4, an outline report giving how far the CRT's traced outlines
  stand from the drawn ones, and a lettering report giving the ink box of
  each piece of text next to the same piece in the reference.
- **The seam report is the primary measure.** The reference is textured
  concept art, so raw pixel difference is noisy. Edge positions are not.
- **A development overlay**: a key press lays the reference over the running
  page at adjustable opacity. Never shipped.
- The bay's interior is masked out of comparisons until the widget can dock.
- CI on every pull request: `astro check`, build, and a Playwright smoke test.


## 10. Milestones

Each ends with a build, a comparison at 1536 x 1024, a summary of what still
differs, and a stop for you to run `pnpm dev`.

| # | Milestone | Delivers | Accepted when |
|---|---|---|---|
| 0 | Groundwork | This document, references, brand files, clean branch | **Done** |
| 1 | Chassis and macro geometry | Scaffold, tokens, the console grid with every panel as a flat, labelled surface, the empty bay, the comparison tools | **Done.** 80 edges measured, none off by more than 1 px |
| 2 | Hero type and content proportions | Header, hero, demo row and equipment strip with real content; faces chosen by overlay | **Done.** 58 pieces of lettering measured, all within tolerance; four carry a documented wider one |
| 3 | CRT physical geometry | Strip, faceplate, funnel, aperture, recess, glass; a flat screen | **Done.** Four outlines held against 1,184 traced points: the aperture is off by 1.8 px at its worst and 0.4 on average, and none of the four by more than 2.9 |
| 4 | The real widget | Widget plumbing (§5.3), lazy loading, the adapter, DAY/NIGHT, live CRT readouts | **Done.** A selection repaints the machine, is back on the page before the widget is, and the CRT reports it: 13 tests. Edges and lettering unchanged |
| 5 | Adaptive theming and cloud | The three behaviors, structural tokens, on-color contrast, cloud bands | **Done.** 24 renders measured, none failing; the sheet reviewed by eye. Edges and lettering unchanged |
| 6 | Material and hardware | Wear, bevels, screws, vents, lamps, labels, in both modes; the field as a surface (§6.3 D); the empty bay's interior (§5.4); the data plate | **Done.** Edges, outlines and lettering unchanged; the contact sheet re-rendered with the hardware |
| 7 | CRT content and motion | Map, isobars, front, clock, scanlines, glow, noise | **Done.** Five tests, one under reduced motion. Edges, outlines and lettering unchanged |
| 8 | Tablet and mobile | The two recompositions in §7 | **Done.** Captured at 1024, 820 and 390; thirteen tests hold them. Desktop edges, outlines and lettering unchanged |
| 9 | Convergence and launch | Final passes, metadata, icons, accessibility, performance, the Vercel project and DNS | **Done.** Live at themeforseen.com. Eight accessibility tests pass; 74 in all |
| W | The widget's new look | The mock's drawer, in the widget's repository | Its tests pass; the drawer matches the mock |
| 10 | Docking | The drawer sits in the bay; the comparison includes it | The whole page converges |

Milestone 4 against an unmodified 0.5.0, if preferred, substitutes these
workarounds for the plumbing: observe `<html style>` instead of an event;
seed the stored selection before the widget boots; repaint from the package's
data when the mode changes with the drawer closed; open the drawer by
clicking the tab inside its shadow root.

Texture, noise and animation are not touched before milestone 6.


### Milestone 9, as built

- **Hosting.** Vercel project `themeforseen-com`, framework Astro, Node 22,
  connected to the GitHub repository: every merge to `main` is a production
  deployment. `themeforseen.com` and `www.themeforseen.com` are attached, the
  `www` redirecting with a 308. DNS is an A record and a CNAME at Namecheap,
  which is the registrar and, now, the nameserver. Production deployment URLs
  are public; previews stay behind Vercel authentication.
- **Metadata.** Open Graph and Twitter card from each page's title and
  description, the social card, the manifest, a sitemap from
  `@astrojs/sitemap`, `robots.txt`, the icon set.
- **About.** The second page, under the same header, one plate: what it is,
  why a weather station, the machine, who, colophon. The brand block keeps
  its full height there, with a strip of chassis under the band.
- **Accessibility.** axe, WCAG 2.1 A and AA, on both pages at the console's
  width and a phone's, by day and by night, with the drawer excluded as the
  widget's own concern. The one finding: white lettering on the brand orange
  is 3.6:1, short of AA for text of that size. Keys now letter themselves by
  the WCAG arithmetic, `contrast-color()` where the browser has it and a
  lightness crossover of 0.6 elsewhere, which puts black on the orange. A
  departure from the reference, recorded in the lettering probe, and one
  number to revert.
- **Performance.** The production page loads in about half a second on a
  warm connection: 79 KB of HTML, 13 KB of CSS, 140 KB of fonts, 25 KB of
  images, and the widget's 61 KB plus 170 KB of collection fetched once the
  page is idle. No framework runtime.

## 11. Decisions

Each has a default. The plan was approved as written on 2026-09-29, so the defaults stand.

| | Decision | Default |
|---|---|---|
| D1 | shadcn and React | Neither |
| D2 | Navigation at launch | Forecast and Examples scroll within the page; Docs goes to the package README; GitHub to the repository; About is a second page, built at milestone 9; **Merch is left off** until there is a store |
| D3 | The station's default theme | Add a purpose-made theme to the product's data, with the mock's cream, ink, orange and teal. The nearest existing theme, "Crisp Tundra", has almost exactly the chassis cream but a teal primary |
| D4 | Where DAY/NIGHT lives | The right end of the CRT label strip |
| D5 | The striped cloud's drips | Solid, as the logo sheet draws them |
| D6 | The drawer on first load, once it can dock | Closed, with the tab showing, so the visitor performs the real interaction. **To revisit at milestone 10**: once the drawer sits in the bay it is part of the machine rather than a sheet over it, and the reference shows it open. Leaning: open on desktop, closed on narrower screens where it would cover the page |
| D7 | The three photographs | Resolved: supplied |
| D8 | Widget plumbing at milestone 4 | Yes |
| D9 | The mountains breaking out of their frame, as in the v1 mock | **Decided 2026-09-29: use it**, under the three rules below |

### D9: the overflow

It is a departure from the canonical mock, so it is recorded here as a
deliberate one.

It earns its place. The machine is rectilinear everywhere, and one cloud
escaping its frame is the right kind of exception for a weather instrument.
It also belongs to the fictional site inside the window, which is where a
flourish like this would really live.

Rules:

1. **The cloud may leave the photograph's frame but never the browser
   window.** Inside the window it is page design. Across the window's edge it
   would be a picture spilling onto painted metal, and the machine would stop
   being believable. The window clips it.
2. **The photograph sits flush against the window's right edge.** The cloud is
   cut straight along the image's right side, which only reads correctly if
   the window is what cuts it. In v2 the photograph is inset 34 px, so it
   moves.
3. **The overflow is 35% of the frame's height; v2 leaves room for 30%.** The
   frame shrinks by about a tenth, or the window trims the top of the cloud.
   Decided by eye at milestone 2.

The window's navigation must stay legible where the cloud passes behind it.
The framed photograph is no longer in the repository; its master is in
`branding/images`.
