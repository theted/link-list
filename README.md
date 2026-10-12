# Link-list

**Simple link-saving tool**

Powered by: drizzle, express, vite, react, react-query, react-hook-form, tailwind, shadcn, etc, etc.

### Requirements

- postgres
- bun

### Deploy

Runs in Docker on the shared EC2 box behind its nginx, at https://link-list.sundbergsolutions.se.
Every push to `master` redeploys through `.github/workflows/deploy.yml`. The box conventions (port
8085, the shared postgres, nginx and certbot) are documented in the private theted/infrastructure
repo.

- **Checkout:** `/opt/link-list`, with its `.env` (mode 600, never in git) beside it; see
  `.env.example` for the keys.
- **Database:** the shared postgres container, with its own `link_list` role and database.
  Migrations in `db/migrations` run when the server starts; generate them with `bun run db:generate`.
- **Google sign-in:** the OAuth client "link-list web" in Google Cloud project `link-list-419120`.
  Its JavaScript origins are the production URL, `http://localhost:5173` and `http://localhost`.
  The consent screen is in Testing, so only the test users listed under Audience can sign in.
