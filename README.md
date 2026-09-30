# themeforseen.com

![CI](https://github.com/mark-mcdermott/themeforseen.com/actions/workflows/ci.yml/badge.svg)

The site for [ThemeForseen](https://www.npmjs.com/package/theme-forseen), a drawer you add to the
site you're building to try color themes and font pairings on the page itself.

The site is a machine: the TF-01 Visual Exploration Unit.

## Status

Live at [themeforseen.com](https://themeforseen.com), deployed by Vercel from `main`. Built one
milestone at a time; the plan records each.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build
pnpm check      # types and templates
pnpm test       # needs a build: edges and lettering against the reference, overflow at four widths,
                # and the drawer repainting the machine
pnpm compare    # capture at 1536 x 1024; report every edge and piece of lettering; images into compare/
pnpm contact-sheet   # the machine under twelve hostile themes, day and night, on one sheet in compare/
pnpm pick-themes     # choose those twelve again from the collection, by measurement
pnpm make-map        # remake the CRT's map from Natural Earth
pnpm make-icons      # remake the favicon set from the brand files
pnpm social-card     # render the social card from the built page
node scripts/outline-wordmark.mjs   # regenerate the wordmark's outlines
```

In development, press `o` to lay the reference over the page, `[` and `]` to change its opacity,
and `d` for a difference blend.

- Direction: [CLAUDE.md](CLAUDE.md)
- Findings, architecture and milestones: [docs/v3-plan.md](docs/v3-plan.md)
- Canonical mock: [design/reference/homepage-v2.png](design/reference/homepage-v2.png)

## History

| | | |
|---|---|---|
| v1 | SvelteKit | tag `v1-final`, branch `v1-sveltekit` |
| v2 | first Astro attempt, aborted | tag `v2-aborted`, branch `v2-astro` |
| v3 | this build | |

## License

MIT
