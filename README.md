# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Scheduled Tasks

### Description MRU Migration

The application uses a standalone script to migrate expense descriptions to the MRU (Most Recently Used) database. This ensures the description autocomplete list stays up-to-date.

To set up daily automated migration at midnight, add this to your crontab:

```bash
# Open crontab editor
crontab -e

# Add this line (adjust path to your installation)
0 0 * * * cd /Users/julianteh/julwrites/homelab/it_services/CashRegister/cash-register && node scripts/migrate-descriptions.mjs >> logs/migration.log 2>&1
```

To run the migration manually:

```bash
node scripts/migrate-descriptions.mjs
```
