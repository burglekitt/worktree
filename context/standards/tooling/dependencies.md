# Dependencies

## Core Rule

Every dependency is a long-term liability. Add one only when the value clearly exceeds the cost.

## DO

- Prefer browser-native or runtime-native APIs when they exist
- Prefer mature, well-maintained libraries with active commits and a healthy issue tracker
- Check bundle impact before adding any client-side dependency (`bundlephobia.com`)
- Commit a lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`)
- Pin exact versions for tooling that breaks easily across minor updates (linters, formatters, build tools)
- Audit dependencies periodically (`pnpm audit`, Dependabot, Renovate)

## DO NOT

- Add a dependency to avoid writing 5–20 lines of straightforward code (`left-pad`, `is-array`, `is-odd`)
- Add a dependency for a feature already provided by the platform (`lodash.clone` → `structuredClone`, `axios` → `fetch`)
- Add unmaintained packages (no commits in 2+ years, open issues piling up, last release stale)
- Add packages with license incompatibilities (GPL into proprietary code, etc.)
- Add packages that pull in massive transitive dependency trees for trivial features

## Native Over Library

Prefer the platform when it does the job:

| Instead of… | Use… |
|---|---|
| `lodash.clone`, `lodash.cloneDeep` | `structuredClone` |
| `axios` | `fetch` |
| `moment`, `date-fns` (for simple cases) | `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` |
| `uuid` (for non-cryptographic IDs) | `crypto.randomUUID()` |
| `query-string` | `URLSearchParams` |
| `classnames` | `clsx` (smaller) or template strings |
| `lodash.debounce`, `lodash.throttle` | tiny custom util or `@uidotdev/usehooks` |

## Evaluating a Library

Before adding, check:

1. **Maintenance** — last release date, commit frequency, issue response time
2. **Adoption** — weekly downloads on npm, GitHub stars relative to age
3. **Bundle size** — `bundlephobia.com/package/<name>` for minified + gzipped size
4. **Transitive deps** — what does it pull in?
5. **Alternatives** — is there a smaller / more focused option?
6. **License** — compatible with your project

## Bundle Impact Tools

```bash
# Inspect the size of a published package
npx bundlephobia <package-name>

# Visualize what's in your bundle
pnpm dlx source-map-explorer dist/assets/*.js

# Vite plugin for bundle analysis
pnpm add -D rollup-plugin-visualizer
```

## When to Vendor or Fork

Vendor (copy into your repo) when:
- The library is unmaintained but you need a small piece of it
- You need a small modification the maintainer won't accept
- The package is so small (< 50 lines) that the dependency overhead exceeds the code

Fork when:
- You need a sustained, significant modification
- You can commit to maintaining the fork

## Lockfile Discipline

- Always commit the lockfile
- Use the same package manager across the team (pnpm preferred — strict, fast, disk-efficient)
- Use `pnpm install --frozen-lockfile` in CI

## PRIORITY

```
Native API > Tiny focused library > Mature comprehensive library > Custom code
```

## See Also

- [`biome.md`](biome.md) — replacing ESLint + Prettier with one tool
- [`vite.md`](vite.md) — bundle analysis
- [`ci.md`](ci.md) — security audits in CI
- [`dates.md`](dates.md) — date library recommendation
