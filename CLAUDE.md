# ThemeForseen

## Product

ThemeForseen is a developer tool for visually exploring color themes and
font pairings on the actual website being built.

The user adds ThemeForseen to a site. A small tab sticks out from the side
of the page. Clicking it opens a full-height drawer over the actual site.

The site itself is the preview surface.

ThemeForseen is NOT a separate website/theme builder with an embedded
preview canvas.

The drawer has two primary areas:

- Color Themes
- Font Pairings

Users experiment visually against their real site, then keep/export/apply
what fits.

Before changing product behavior or duplicating product data in marketing
UI, inspect the existing implementation.

Treat the source code as authoritative about current ThemeForseen
capabilities.


# Marketing Site Concept

ThemeForseen's visual identity reinterprets "foreseen" as weather
forecasting rather than fortune telling.

The marketing site is itself a fictional physical instrument:

    TF-01 VISUAL EXPLORATION UNIT

It should feel like an elaborate late-1970s/early-1980s meteorological,
scientific, broadcast, or computing instrument whose oddly specific
purpose is exploring website colors and typography.

Relevant visual references include:

- vintage meteorological equipment
- NOAA/weather-station equipment
- old weather radar displays
- Braun instrumentation
- Tektronix equipment
- NASA/control-room hardware
- broadcast equipment
- scientific instruments
- technical manuals
- cream/off-white painted metal
- black recessed hardware
- teal phosphor displays
- orange/coral/yellow accents
- screws
- vents
- labels
- gauges
- switches
- CRTs
- paper notes and equipment stickers
- subtle physical wear

This is not merely a normal website decorated with retro graphics.

THE WEBSITE ITSELF SHOULD FEEL LIKE THE MACHINE.

The absurdity of an elaborate physical machine performing a very focused
task is part of the personality.

Avoid:

- generic SaaS layouts
- generic shadcn-style landing-page composition
- purple gradients
- glassmorphism
- generic "retro computer" decoration
- flattening the design merely because ordinary web components are easier


# Canonical Visual References

The current approved homepage reference is:

    design/reference/homepage-v2.png

Treat this image as the canonical desktop art direction.

Earlier references, including homepage-v1.png, may remain in the repository
for design history but MUST NOT override v2.

The approved cloud geometry and small-size variants are documented in:

    design/reference/cloud-logo-sheet.png

Use that sheet as the source of truth for cloud geometry.

The homepage concept art may contain AI-generated approximations of the
cloud. Do NOT trace those approximations when the logo sheet disagrees
with them.

Reference hierarchy:

    Homepage reference controls composition and art direction.
    Logo sheet controls logo geometry.
    Product source code controls product behavior.

At approximately 1536x1024, reproduce homepage-v2.png as closely as
practical.

The target is not merely:

    "a retro weather-station-inspired website"

The target is the particular physical object depicted in the reference:
its proportions, density, typography, panel construction, CRT geometry,
drawer relationship, and industrial character.

Do not allow implementation convenience or generic component-library
defaults to flatten the design into a conventional SaaS landing page.

Do not simplify distinctive shapes merely because ordinary web UI
components would be easier.

In particular, preserve:

- the large integrated physical-console composition
- panel proportions and seams
- substantial black CRT bezel
- curved CRT aperture/glass
- recessed physical depth
- equipment labels
- physical controls
- small hardware details
- dense but intentional instrumentation
- tactile painted-metal character
- oversized hero typography
- strong relationship between hero, CRT, and ThemeForseen drawer

The target is not "inspired by the mock."

The target is a faithful implementation of the mock using maintainable
web primitives.


# Product / Marketing Distinction

The most important product concept is:

    YOUR SITE IS THE PREVIEW.

ThemeForseen is a tab/drawer widget installed on the user's actual website.

A tab sticks out from the side of the page.

Clicking it opens a full-height drawer containing ThemeForseen controls.

The actual website being built remains visible and changes in place.

There is no separate ThemeForseen preview canvas.

The drawer's two primary areas are:

- Color Themes
- Font Pairings

The marketing site should eventually run the real ThemeForseen widget so
theme and font changes affect themeforseen.com itself.

Do not build a fake independent ThemeForseen implementation solely for
the marketing page when the actual product can be reused.

Treat the number of palettes and font pairings as dynamic/unbounded.

Never design around a fixed marketing-created list such as six palettes.

Inspect the current product source before relying on exact schema,
terminology, filters, actions, or counts.


# The Main Product Demo

The key demonstration should eventually be:

1. The real ThemeForseen tab appears on themeforseen.com.
2. The user clicks it.
3. The real ThemeForseen drawer opens.
4. The user browses Color Themes and/or Font Pairings.
5. The user selects something.
6. The entire ThemeForseen marketing-site machine changes in place.
7. The adaptive cloud logo changes its palette stripes.
8. The CRT reports the new "conditions."
9. DAY/NIGHT can demonstrate the selected light/dark configurations.

This should feel like changing the operating conditions of a physical
machine.

The CRT reports the change.

THE WEBSITE DEMONSTRATES THE CHANGE.

Do not reverse those roles.


# CRT — KEEP IT

The CRT is intentional and important.

Do NOT remove it in favor of a conventional landing-page preview or
generic content panel.

The CRT is one of the major elements that prevents the site from becoming
a conventional SaaS landing page with retro styling.

However:

    THE CRT IS NOT THE THEMEFORSEEN LIVE PREVIEW.

The user's actual webpage is the preview surface.

The CRT is atmospheric instrumentation belonging to the fictional TF-01
weather station.


## CRT Content

Prefer restrained meteorological/scientific instrumentation rather than
a beautiful landscape photograph that dominates the page.

The approved direction includes:

- dark teal/phosphor display
- weather/synoptic map
- contour/isobar lines
- restrained weather-system graphics
- ThemeForseen identity
- current palette
- current font pairing
- current mode
- signal/status indicators
- CURRENT CONDITIONS
- THEME CONDITIONS
- EXPLORATION CONDITIONS
- GOOD DESIGN AHEAD

The CRT can report the currently selected ThemeForseen state.

For example:

    CURRENT CONDITIONS

    PALETTE     GOLDEN HOUR
    TYPE        NEWSREADER + INTER
    MODE        DAY

    THEME SIGNAL
    ACTIVE

    EXPLORATION
    ACTIVE

The CRT may use real dynamic product information where appropriate.

Do NOT present design-quality measurements as real product capabilities.

Labels or readouts such as:

    87% clarity
    76% contrast
    82% harmony
    design score
    quality score

visible in concept art are DECORATIVE CONCEPT ART ONLY and should NOT be
implemented unless the actual product genuinely computes those values.

ThemeForseen helps users explore.

It does not claim to objectively score design quality.


## CRT Visual Treatment

The CRT should remain visually impressive but should not overpower the
actual ThemeForseen interaction.

Its magic should come primarily from:

- physical bezel geometry
- phosphor glow
- scanlines
- glass
- subtle bloom
- vignette
- restrained noise
- subtle moving weather-map/radar information
- occasional restrained analog-display imperfections

Avoid turning it into a Fallout-style terminal, fake hacker terminal, or
novelty animation.

Motion should be subtle enough that the CRT feels alive without constantly
demanding attention.


# CRT Physical Construction

Treat the CRT as a hero object deserving unusually careful implementation.

Do not reduce it to an ordinary rounded rectangle.

The reference contains nested physical geometry:

1. cream chassis
2. dark outer faceplate
3. substantial black bezel
4. curved inner aperture
5. recessed cavity
6. curved CRT glass
7. screen/content plane

The inner aperture has a genuine old-CRT silhouette, not merely ordinary
CSS border-radius.

Use nested HTML/CSS and SVG masks/paths where appropriate.

Preserve the bowed/curved aperture geometry visible in the reference.

Tune SVG Bezier curves against the reference rather than accepting a
generic rounded rectangle.

The substantial curved black bezel is a major part of the site's visual
identity and should receive careful visual-comparison passes.


# Adaptive Cloud Identity

The approved cloud geometry is defined separately from its color treatment.

The cloud SHAPE is the stable ThemeForseen brand mark.

The large digital/hero version may contain horizontal palette stripes.

Those stripes should respond to the currently active ThemeForseen palette.

Conceptually:

    cloud shape   = ThemeForseen
    stripe colors = current conditions / active palette
    outline       = structural foreground

The default ThemeForseen palette produces the familiar
teal/yellow/orange/coral treatment shown in the canonical reference.

When the selected palette changes, the stripe colors may change with it.

Do not hard-code the default stripe colors into the logo artwork if doing
so would prevent this behavior.

Prefer an SVG whose stripe fills are driven by CSS variables.

The exact mapping from a ThemeForseen theme to stripe colors should be
visually robust rather than blindly mapping semantic roles when that
would create poor contrast.

Subtle transitions between stripe colors are acceptable when the user
changes themes.


## Logo Variants

Maintain monochrome logo variants.

Use them where adaptive stripes are inappropriate:

- very small UI
- embossing/debossing
- hardware manufacturer marks
- one-color reproduction
- GitHub/readme contexts
- merch
- CRT/phosphor rendering

The same cloud can therefore appear in different material contexts.

For example:

    Top-left brand:
        adaptive striped cloud

    Hardware badge:
        monochrome or embossed cloud

    CRT:
        phosphor cloud

    Tiny UI:
        purpose-drawn small-size mark

Do not simply scale the full-size logo down when a dedicated micro variant
exists.

Use:

    design/reference/cloud-logo-sheet.png

as the source of truth for those variants.


# Theme Responsiveness

Think of the site as having three categories of visual behavior.


## 1. Theme-responsive

These should respond strongly to the selected ThemeForseen theme:

- major chassis/panel surfaces
- page foreground/text
- buttons
- cards
- large content surfaces
- typography
- appropriate accent details


## 2. Theme-aware

These may borrow or react to the current theme without surrendering their
identity:

- CRT telemetry accents
- selected indicator lights
- adaptive logo stripes
- small visualization details
- selected equipment readouts


## 3. Brand/hardware-fixed

These should remain relatively stable so the machine retains identity:

- core CRT darkness
- physical shadows/depth
- screws and metal hardware
- some equipment markings
- monochrome manufacturer marks
- selected indicator/hardware details

Do not make every pixel blindly follow theme variables.


# Light / Dark

ThemeForseen supports separate light and dark theme choices.

Represent this capability as a physical:

    DAY / NIGHT

control.

Do not use a generic SaaS sun/moon toggle as the primary visual treatment.

DAY/NIGHT should feel like a physical switch belonging to the TF-01
instrument.

The default DAY state resembles the cream station in the reference.

NIGHT should feel like THE SAME MACHINE under different conditions, not
an unrelated redesign.

A dark theme may include:

- dark painted chassis
- appropriate foreground text
- stronger perceived indicator glow
- stronger perceived CRT illumination
- adapted structural highlights/shadows
- different visibility of physical wear

The texture/structural system must work in both modes.


# Surface Texture and Contrast

Texture and structure are different systems.

This distinction is important because users can select many very
different ThemeForseen palettes.


## Surface Wear

Surface wear may intentionally become more or less visible depending on
the underlying color.

Prefer separate transparent/grayscale texture layers such as:

- dark grime/scratches
- light scuffs/worn paint
- fine material grain
- subtle discoloration
- paper/sticker wear where appropriate

Dark wear can use multiply-like behavior.

Light wear can use screen/soft-light-like behavior.

On dark themes, some dark wear may disappear while light scuffs become
more apparent.

On light themes, the reverse may happen.

This is desirable and can make the material feel more physically
plausible.

Do NOT attempt to force every scratch to maintain identical contrast
against every palette.

Decorative wear is allowed to fade.


## Structural Details

Structural details MUST remain understandable across themes.

These include:

- panel edges
- recessed borders
- seams
- screws
- vents
- controls
- labels
- buttons
- CRT housing
- interactive states
- focus states

Derive these from theme-aware foreground/surface values or controlled
light/dark mixtures.

A useful conceptual rule is:

    DECORATIVE WEAR MAY FADE.
    STRUCTURE MUST NOT.

Test the system against substantially different palettes, not only the
default cream theme.


# Material Implementation

Do NOT implement the console as one giant background image with HTML
hotspots.

Prefer real HTML/CSS/SVG.


## Good candidates for HTML/CSS

- overall chassis
- responsive panel grid
- panel backgrounds
- borders
- bevels
- seams
- typography
- labels
- buttons
- lamps
- vents
- theme cards
- font cards
- code displays
- most screws/fasteners
- CRT housing
- CRT glass effects


## Good candidates for SVG

- cloud logo
- CRT aperture/mask if useful
- unusually shaped controls
- knobs where SVG gives better physical detail
- technical diagrams
- weather/synoptic vectors
- shapes whose geometry cannot be reproduced faithfully with ordinary
  border-radius


## Good candidates for raster/video assets

- weather photography where intentionally used
- radar/satellite source imagery
- subtle seamless material texture
- scratches/grain
- paper/sticker texture
- optional CRT noise

Keep raster assets small and composable whenever practical.

Texture assets should generally be transparent/grayscale overlays rather
than containing the chassis color.

ThemeForseen must be able to change the underlying surface color without
losing the physical-material treatment.


# Component Architecture

Prefer reusable physical primitives rather than one giant page-specific
stylesheet.

Potential primitives include:

- ConsoleShell
- InstrumentPanel
- PanelLabel
- Screw
- IndicatorLamp
- ToggleSwitch
- HardwareButton
- Knob
- Vent
- CRT
- CRTScreen
- EquipmentLabel
- AdaptiveCloudLogo
- PaletteSwatches
- CodeOutput

Names can differ according to existing project conventions.

Do not over-componentize tiny elements when CSS or pseudo-elements are
simpler.

The goal is a reusable physical design system, not abstraction for its own
sake.


# Real ThemeForseen Integration

Use the real ThemeForseen implementation wherever practical.

Do not create a second hard-coded representation of ThemeForseen's
available themes, font pairings, filters, or drawer behavior merely for
the marketing page.

The number of available themes should be treated as dynamic/unbounded.

Current source code is authoritative.

At the time this direction was created, relevant concepts observed in the
product included:

- separate light and dark theme configurations
- multiple semantic color roles per theme
- five primary palette swatches commonly exposed in theme summaries:
  Primary, Accent, Background, Card Background, Text
- additional underlying theme values such as shadow/extra roles
- Color Themes and Font Pairings as the two main drawer areas
- font categories including Sans, Serif, Display, and Mono
- theme search/filter/favorite/star concepts
- ability to export/apply theme information

These details may evolve.

Inspect the implementation rather than relying on this document if there
is a discrepancy.

Source code wins for product behavior.


# Palette / Font Collection Representation

Do not visually imply that ThemeForseen contains only a handful of
marketing-created palettes.

The collection should feel large and browsable.

The UI should remain correct whether there are:

- 20 themes
- 100 themes
- 500 themes
- more in the future

The same applies to font pairings.

Use actual product data where practical.

Do not create unnecessary coupling between marketing layout and the exact
number of themes.


# Responsive Behavior

Do not attempt to scale the entire desktop console down uniformly.

RESPONSIVENESS IS ART DIRECTION.


## Desktop / Wide

At the canonical reference viewport:

    approximately 1536x1024

closely match the approved reference.

The console behaves like one enormous integrated piece of hardware.

Preserve the dramatic horizontal composition.


## Tablet

Reflow physical modules while retaining the equipment metaphor.

For example:

- CRT may become full-width
- hero and controls may recompose
- ThemeForseen controls can occupy their own instrument module
- horizontal instrument sections can stack intentionally


## Mobile

Do NOT create a miniature desktop console.

Recompose into a tall stack of physical instrument modules.

For example:

1. Header / manufacturer plate
2. See What Fits hero
3. CRT
4. current conditions / controls
5. product explanation
6. Explore
7. Preview
8. Apply
9. equipment/footer modules

Visible panel seams should make the rearrangement feel intentional.

Preserve useful physical detail without making the UI unreadable.


## General Responsive Rules

Width determines composition.

Do not force the whole page into 100vh.

Allow natural vertical scrolling.

Use modern layout primitives such as:

- CSS Grid
- container queries
- clamp()
- aspect-ratio

Avoid absolute-positioning the entire interface merely to match one
screenshot.

At very wide widths, prefer a sensible maximum console width rather than
stretching the instrument indefinitely.


# Visual Validation

Visual fidelity matters unusually strongly on this project because
ThemeForseen itself is a visual-design tool.

When implementing against the canonical reference:

1. Run the site.
2. Render/screenshot at the canonical viewport.
3. Compare against homepage-v2.png.
4. Identify concrete visual differences.
5. Adjust.
6. Repeat.

Do not declare the implementation complete merely because all content
from the mock exists.

Compare:

- overall silhouette
- macro proportions
- panel dimensions
- hero typography
- spacing
- CRT size
- CRT aperture geometry
- black bezel thickness
- drawer proportions
- border/bevel depth
- shadows
- surface texture
- control scale
- visual density
- alignment
- overall physical plausibility

Prefer iterative visual convergence over one large implementation pass.

Pixel-level fidelity is particularly important at the canonical desktop
viewport.

Responsive layouts away from that viewport should preserve the design
system and intent rather than attempting literal pixel identity.


# Implementation Order

Unless there is a good reason to deviate, build in this order:

1. Inspect existing repository and ThemeForseen implementation.
2. Establish canonical reference assets.
3. Build chassis and overall desktop grid.
4. Match hero typography and major proportions.
5. Build CRT housing/aperture/glass.
6. Integrate real ThemeForseen product/demo behavior.
7. Implement adaptive theming and adaptive cloud identity.
8. Add physical surface treatment and hardware details.
9. Build CRT atmospheric content and restrained motion.
10. Build responsive tablet/mobile compositions.
11. Perform repeated final screenshot-comparison passes.

Do not start with texture/polish before the large geometry matches the
reference.


# Product Voice

ThemeForseen is deliberately focused.

It does not need inflated claims.

Good concepts include:

    See what fits.

    Try stuff. Keep what fits.

    Explore color themes and font pairings live on your site.

    Preview fonts and color palettes live on the site you're building.

    Made for trying things.

    Same site. Different conditions.

    Good design ahead.

ThemeForseen helps people explore.

It does not judge design quality.

Avoid unsupported claims such as:

- automatically makes design better
- objectively evaluates good design
- produces a design-quality score
- guarantees better design decisions

The elaborate machine is allowed to be playful.

The product claim should remain modest.

A useful guiding principle is:

    THE BRAND CAN BE ENORMOUS.
    THE CLAIM CAN BE TINY.


# General Engineering Rule

Maintain the visual ambition of the approved design without sacrificing
the underlying product architecture.

When visual fidelity and maintainability appear to conflict, first look
for a better CSS/SVG/component solution rather than immediately
simplifying the design.

Do not replace distinctive visual elements with generic UI merely because
generic UI is easier to implement.

At the same time, do not create brittle one-viewport screenshot code.

The desired result is:

    visually unusual
    physically convincing
    responsive
    maintainable
    faithful to the actual product


# Project Setup

Facts about this repository and how work on it is run. Everything above is
design direction; this section is logistics.


## Where things live

    This repo            ~/Dev/themeforseen.com-proj/themeforseen.com
    Product source       ~/Dev/theme-forseen-proj/theme-forseen
                         (npm: theme-forseen, a separate public repo)
    Brand masters        ~/Dev/themeforseen.com-proj/branding
    All mock iterations  ~/Dev/themeforseen.com-proj/mocks

    design/reference/    canonical mocks and the logo sheet
    design/brand/        the logo SVGs, favicon sources and the zozo mascot
    docs/v3-plan.md      findings, architecture and the milestone plan

The product and this site are two projects. When the product's behavior is
in question, read the product source; do not copy its data into this repo.

Planning notes written elsewhere call this file AGENTS.md. It is this file.

zozo, the CRT mascot, is a brand asset kept for merch and similar uses. The
canonical homepage does not include it; do not add it to the page unasked.


## History

    v1   SvelteKit app            tag v1-final     branch v1-sveltekit
    v2   first Astro attempt      tag v2-aborted   branch v2-astro
    v3   this build, a clean start

v2 was abandoned on design grounds. Do not port code, components or styling
from v1 or v2 into v3.


## Stack

    Astro, static output
    Tailwind CSS 4, configured in CSS
    TypeScript, strict
    pnpm
    Vercel for hosting, Namecheap for the domain

No component library and no UI framework (docs/v3-plan.md, decision D1). The
interface is bespoke physical primitives; interactive pieces are small
vanilla scripts or custom elements, the same way the product is built.


## Conventions

    Commits      conventional commits: type(scope): description
    Merging      automerge is on; a phase's PR merges once it is approved
    PRs          opened ready for review, never as drafts


## Process: one phase at a time

Work follows the milestones in docs/v3-plan.md, in order, and stops at the
end of each one.

At the end of a phase:

1. Make sure the build and type check pass.
2. Capture the page at 1536x1024 and compare it with homepage-v2.png.
3. Summarize what was built, what still differs from the reference, and
   what the next phase is.
4. Stop and ask Mark to run `pnpm dev` and look at it.
5. Continue only after he replies.

Stop mid-phase only for a decision that is genuinely his and that would
change the work: a product claim, a change to the approved composition, or
anything that alters the product itself. Routine judgment calls are made,
noted in the summary, and not escalated.

Do not run ahead into the next phase while waiting.
