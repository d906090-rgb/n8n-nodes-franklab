# Public Repository Boundary

This package is designed to be mirrored into the public repository:

```text
https://github.com/d906090-rgb/n8n-nodes-franklab
```

Only the contents of `integrations/n8n-nodes-franklab` should be copied into that public repository.

## Allowed In Public Repo

- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`
- `.gitignore`
- `.prettierrc.js`
- `CHANGELOG.md`
- `LICENSE`
- `PUBLIC_REPO.md`
- `README.md`
- `credentials/**`
- `eslint.config.mjs`
- `examples/**`
- `nodes/**`
- `package-lock.json`
- `package.json`
- `test/**`
- `tsconfig.json`

## Never Copy To Public Repo

- FrankLab backend source code.
- Provider integrations or provider credentials.
- Billing internals, database schema, partner admin routes, or MCP tooling.
- Monorepo root files unless explicitly reviewed for public release.
- `.env`, npm tokens, GitHub secrets, API keys, PEM files, private keys, certificates, or runtime state.
- Generated `dist/` output or `node_modules/`.

## Publish Source

npm provenance must come from the public package repository. Do not publish this package from the private monorepo, because npm rejects provenance bundles from private GitHub Actions source repositories.

## Release Checklist

1. Sync only this package directory into the public repository root.
2. Confirm `package.json` points to `git+https://github.com/d906090-rgb/n8n-nodes-franklab.git`.
3. Confirm the public repository is visible as public on GitHub.
4. Confirm `NPM_TOKEN` or a Trusted Publisher is configured for the public repository.
5. Run CI in the public repository.
6. Push the release tag `n8n-nodes-franklab-v<version>`.
7. Verify the npm package and run `npm run scan:published`.
