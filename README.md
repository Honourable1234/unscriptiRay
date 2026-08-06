# Unscripti Frontend Web

The frontend web application for **Unscripti**, built with Next.js 16, React 19, Tailwind CSS 4, and TypeScript.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **i18n:** [next-intl](https://next-intl.dev) (English + French)
- **Error Monitoring:** [Sentry](https://sentry.io)
- **Analytics:** [PostHog](https://posthog.com)
- **Validation:** [Zod](https://zod.dev)
- **Env Validation:** [T3 Env](https://env.t3.gg)

## Requirements

- Node.js 20+
- npm

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with live reload |
| `npm run build` | Production build |
| `npm run build-local` | Production build (local, no remote services) |
| `npm run start` | Start production server |
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run check:types` | TypeScript type checking |
| `npm run check:deps` | Detect unused dependencies and files (Knip) |
| `npm run check:i18n` | Validate translation keys |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-stats` | Analyze bundle size |
| `npm run commit` | Interactive commit message helper |

## Project Structure

```
.
├── .github/                  # GitHub Actions workflows and config
├── .storybook/               # Storybook configuration
├── .vscode/                  # VSCode settings, extensions, debug config
├── public/                   # Static assets (favicons, etc.)
├── src/
│   ├── app/                  # Next.js App Router pages and layouts
│   ├── components/           # Shared React components
│   ├── libs/                 # Third-party library configuration
│   ├── locales/              # i18n translation files (en, fr)
│   ├── styles/               # Global CSS
│   ├── templates/            # Page templates
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Utility functions and config
├── tests/
│   └── e2e/                  # Playwright E2E tests
├── eslint.config.mjs
├── next.config.ts
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.mts
```

## Development Guidelines

### Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commit messages are validated by Commitlint via a Lefthook pre-commit hook.

Format: `type: summary`

| Type | Description |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no logic changes) |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Tests |
| `build` | Build system |
| `ci` | CI/CD |
| `chore` | Maintenance |
| `revert` | Revert a commit |

Use `npm run commit` for an interactive prompt.

### Pre-commit Hooks

Lefthook runs these checks automatically on every commit:

- **lint** - ESLint
- **check-types** - TypeScript compiler
- **knip** - Unused dependency/file detection

### Testing

- **Unit tests** (`*.test.ts`) live next to their source files. Run with `npm run test`.
- **E2E tests** (`*.e2e.ts`) live in `tests/e2e/`. Run with `npm run test:e2e`.
- Install Playwright browsers first: `npx playwright install`

### Internationalization (i18n)

Translation files are in `src/locales/`. The default locale is English (`en`), with French (`fr`) as a secondary locale.

- Server components: use `getTranslations`
- Client components: use `useTranslations`
- Never hard-code user-facing strings

### Environment Variables

All env vars are validated through `src/libs/Env.ts` using T3 Env + Zod. Never read `process.env` directly.

### Storybook

Stories live alongside components as `*.stories.tsx` files.

```sh
npm run storybook
```

Opens at [http://localhost:6006](http://localhost:6006).

## Error Monitoring

### Local Development

Sentry Spotlight captures errors locally during development. View them at `http://localhost:8969`.

### Production

Set these environment variables:

```sh
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORGANIZATION=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

## Deployment

```sh
npm run build
npm run start
```

The app builds as static/SSG where possible. No database required.

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
