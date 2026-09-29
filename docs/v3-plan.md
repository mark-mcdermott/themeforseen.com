# ThemeForseen v3: findings and build plan

Status: **awaiting approval** · written 2026-09-29 · no implementation code exists yet

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
| Live site | none: `themeforseen.com` does not resolve and no Vercel project exists |
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
| CRT label strip | 475 to 1025 | 100 to 131 | 550 x 31 | |
| CRT faceplate | 465 to 1035 | 137 to 590 | 570 x 453 | |
| CRT aperture | 507 to 997 | 172 to 552 | 490 x 380 | 1.29 : 1 |
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

Acceptance for this system is a contact sheet: the console rendered under
twelve deliberately different themes in both modes, every seam and label
still readable.

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
| Phosphor | the CRT | outline, with glow |
| Micro | 16 px | redrawn on the pixel grid from your tuned 16 px file, drips spaced wider |

Band colors are chosen by the adapter, not mapped role by role. It takes the
palette's chromatic colors, drops any too close to the ink or to each other,
orders them cool and dark at the top to warm and light at the bottom, and
sets `--cloud-1` through `--cloud-5`. Fills transition over 400 ms.

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

Final faces are chosen at milestone 2 by laying each candidate over the
reference, not from memory.


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

### Needed from you

| Asset | Use | Specification |
|---|---|---|
| Desert with Joshua trees, warm light | light demo window | landscape, 1600 px wide or more |
| Snow-covered mountains, broken cloud | dark demo window | the same |
| Desert panorama under cloud, monochrome | equipment strip | wide, about 5 : 2 |

These are photographs and cannot be drawn. Either you supply them or I source
license-free ones (D7).

### To be made

| Asset | Form |
|---|---|
| Map of the United States | SVG path from Natural Earth (public domain), simplified once and committed |
| Isobars, pressure centers, fronts | SVG, generated |
| Micro cloud, 16 px filled and outline | SVG on a 16 unit grid |
| Favicon set | `favicon.svg`, `favicon.ico` (16 and 32), touch icon 180, icons 192 and 512 |
| Framework marks | SVG from Simple Icons |
| Wear, grain, CRT noise | procedural |
| Social card | rendered from the page |


## 9. Verification

Built in milestone 1 and used at the end of every phase.

- **`pnpm compare`** captures the page at 1536 x 1024 and writes, to an
  ignored folder: the capture beside the reference, a 50% blend, a difference
  map, and a seam report giving the position of every major edge next to the
  table in §4.
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
| 1 | Chassis and macro geometry | Scaffold, tokens, the console grid with every panel as a flat, labelled surface, the empty bay, the comparison tools | Every edge in §4 within 4 px |
| 2 | Hero type and content proportions | Header, hero, demo row and equipment strip with real content; faces chosen by overlay | Headline glyph edges within 3 px; baselines aligned |
| 3 | CRT physical geometry | Strip, faceplate, bezel, aperture, recess, glass; a flat screen | The aperture matches along its whole perimeter within 3 px |
| 4 | The real widget | Widget plumbing (§5.3), lazy loading, the adapter, DAY/NIGHT, live CRT readouts | A selection repaints the machine, survives reload, and the CRT reports it |
| 5 | Adaptive theming and cloud | The three behaviors, structural tokens, on-color contrast, cloud bands | The contact sheet in §6.3 passes |
| 6 | Material and hardware | Wear, bevels, screws, vents, lamps, labels, in both modes | Day and night read as one machine |
| 7 | CRT content and motion | Map, isobars, front, clock, scanlines, glow, noise | Alive without drawing the eye; still under reduced motion |
| 8 | Tablet and mobile | The two recompositions in §7 | Reviewed at 1024, 820, 390 |
| 9 | Convergence and launch | Final passes, metadata, icons, accessibility, performance, the Vercel project and DNS | You sign it off |
| W | The widget's new look | The mock's drawer, in the widget's repository | Its tests pass; the drawer matches the mock |
| 10 | Docking | The drawer sits in the bay; the comparison includes it | The whole page converges |

Milestone 4 against an unmodified 0.5.0, if preferred, substitutes these
workarounds for the plumbing: observe `<html style>` instead of an event;
seed the stored selection before the widget boots; repaint from the package's
data when the mode changes with the drawer closed; open the drawer by
clicking the tab inside its shadow root.

Texture, noise and animation are not touched before milestone 6.


## 11. Decisions

Each has a default. Approving the plan approves the defaults.

| | Decision | Default |
|---|---|---|
| D1 | shadcn and React | Neither |
| D2 | Navigation at launch | Forecast and Examples scroll within the page; Docs goes to the package README; GitHub to the repository; About is a second page built at milestone 9; **Merch is left off** until there is a store |
| D3 | The station's default theme | Add a purpose-made theme to the product's data, with the mock's cream, ink, orange and teal. The nearest existing theme, "Crisp Tundra", has almost exactly the chassis cream but a teal primary |
| D4 | Where DAY/NIGHT lives | The right end of the CRT label strip |
| D5 | The striped cloud's drips | Solid, as the logo sheet draws them |
| D6 | The drawer on first load, once it can dock | Closed, with the tab showing, so the visitor performs the real interaction |
| D7 | The three photographs | You supply them |
| D8 | Widget plumbing at milestone 4 | Yes |
