# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Clean start for v3. The v1 SvelteKit app is preserved at tag `v1-final`; the aborted v2 rebuild
  at tag `v2-aborted`.

### Added

- Design direction, canonical references, brand files and the v3 plan
- Milestone 1: the console's chassis and grid at the reference's measured proportions, every
  panel a flat surface, with the drawer bay shown stowed
- Reference geometry as data, a comparison script, a development overlay, and tests that hold
  every edge to within 4 px of the reference
- Milestone 2: the header, hero, demo windows, steps and equipment strip with their real content;
  the cloud and wordmark; self-hosted faces chosen by measuring candidates against the reference
- Lettering probes: the comparison and the tests now measure where each piece of text sits
- Milestone 4: the real ThemeForseen drawer runs on the page. A selection repaints the machine,
  the CRT reports the palette, faces, mode and whether anyone is exploring, and a physical
  DAY/NIGHT switch sits on the CRT's label strip
- The station's conditions are remembered and restored before the first paint
- The version and the collection's counts are read from the package when the site is built
- theme-forseen 0.6.1: arrow keys in the drawer no longer skip rows, and a key press takes a fifth of the time
- Milestone 5: the machine's structure survives any palette. Seams, edges and recesses are the
  chassis colour moved a fixed distance in lightness; lettering on a coloured surface is black or
  white by the surface's lightness; the cloud's bands come from the active palette. A contact sheet
  of twelve deliberately hostile themes in both modes, chosen by measurement, rendered by
  `pnpm contact-sheet` and measured by the tests
- Milestone 6: the surfaces become metal. Every panel is a plate with a groove and a lit edge,
  screws at its corners, drilled grids and vent slots where the reference has them; keys stand off
  the plate; grime and worn paint fall on every plate differently and trade places by night. The
  field is a wall with the unit's shadow on it, the machine centres in a tall window, and a
  manufacturer's data plate sits beneath. The bay's interior has rails, an edge connector, a
  service label and a status lamp
- Milestone 7: the tube comes alive. A map of the contiguous states from Natural Earth, isobars
  round a high and a low, a warm front, the station's clock, the cloud in phosphor, scanlines, glow,
  grain and a faint flicker, all of it still under reduced motion
- Milestone 8: tablet and phone compositions. Below 1280 px the modules reflow rather than shrink:
  a manufacturer's plate with the navigation behind a key, the hero beside or above the tube, a
  controls module in place of the bay, each demo window above its own step, the strip in two rows,
  then a single stack on a phone with the tube's secondary readouts removed
