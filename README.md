# ThemeForseen

A web-based design tool that helps developers find the right color palette and fonts for their site.

## About

[theme-forseen](https://www.npmjs.com/package/theme-forseen) is an npm library that provides color themes and font pairings for web projects.

[themeforseen.com](https://themeforseen.com) is the companion website that serves as documentation for the library and offers additional web-based tools for working with colors and fonts. Some features are free, while others require a premium account (one-time $5 payment).

## Features

### Design Tools

- **Color Theme Explorer** - Browse over 1,500 pre-built color themes with light/dark variants
- **Font Pairing Finder** - Curated font pairings from Fontsource and Google Fonts
- **Live Preview** - Real-time preview of themes applied to template designs
- **Color Extraction** - Extract dominant colors from uploaded images
- **Theme Export** - Export themes as CSS variables, Sass, Tailwind config, or JSON

### Accessibility

- WCAG contrast checker for color combinations
- Color blindness simulator (Protanopia, Deuteranopia, Tritanopia)

### A/B Testing

- Create and share A/B tests to compare theme variants
- Vote-based comparison system with unique shareable codes

### Merchandise Store

- T-shirts, hoodies, mugs, and stickers
- Stripe payment processing
- Printful print-on-demand fulfillment

### Premium Features ($5 one-time)

- Unlimited saved favorites
- Custom color palette creation
- Custom font uploads (WOFF2, WOFF, TTF, OTF)
- Full export formats and accessibility tools

## Tech Stack

- **Frontend**: Svelte 5, SvelteKit 2, Tailwind CSS 4, TypeScript
- **Backend**: Node.js 22+, Drizzle ORM, Neon PostgreSQL
- **Auth**: Lucia
- **Payments**: Stripe
- **Fulfillment**: Printful
- **Email**: Resend
- **Deployment**: Cloudflare Workers

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...

# Printful
PRINTFUL_API_KEY=...
PRINTFUL_STORE_ID=...  # For multi-store accounts
```

### Development

```bash
# Start dev server
pnpm dev

# Type checking
pnpm check

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

### Production

```bash
# Build
pnpm build

# Preview build locally
pnpm preview
```

## Scripts

| Script          | Description                  |
| --------------- | ---------------------------- |
| `dev`           | Start development server     |
| `build`         | Production build             |
| `preview`       | Preview production build     |
| `check`         | Run Svelte type checking     |
| `test`          | Run unit tests (watch mode)  |
| `test:run`      | Run unit tests once          |
| `test:coverage` | Generate coverage report     |
| `test:e2e`      | Run Playwright E2E tests     |
| `db:generate`   | Generate database migrations |
| `db:push`       | Apply migrations to database |
| `db:studio`     | Open Drizzle Studio          |

## Project Structure

```
src/
├── routes/           # SvelteKit pages and API endpoints
│   ├── api/          # REST API (Stripe, store, A/B tests, etc.)
│   ├── account/      # User dashboard
│   ├── merch/        # Merchandise store
│   ├── export/       # Theme export
│   └── ...
├── lib/
│   ├── server/       # Server-side code
│   │   ├── db/       # Database schema and queries
│   │   ├── auth.ts   # Lucia auth config
│   │   ├── stripe.ts # Stripe integration
│   │   └── printful.ts
│   ├── components/   # Svelte components
│   ├── stores/       # Svelte stores (cart, etc.)
│   └── data/         # Static data (products, themes)
├── tests/            # Test setup and mocks
e2e/                  # Playwright E2E tests
drizzle/              # Database migrations
```

## License

MIT
