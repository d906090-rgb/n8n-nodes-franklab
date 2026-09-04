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
- `.npmrc`
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
- `tooling/.npmrc`
- `tooling/link-node-cli.mjs`
- `tooling/package-lock.json`
- `tooling/package.json`
- `tooling/run-node-cli.mjs`
- `tsconfig.json`

## Never Copy To Public Repo

- FrankLab backend source code.
- Provider integrations or provider credentials.
- Billing internals, database schema, partner admin routes, or MCP tooling.
- Monorepo root files unless explicitly reviewed for public release.
- `.env`, npm tokens, GitHub secrets, API keys, PEM files, private keys, certificates, or runtime state.
- Generated `dist/` output or `node_modules/`.

`tooling` is a `private:true` development-only npm contour. It is required in the public source repository so CI and release commands remain self-contained, but its manifest, lockfile, helpers, and installed dependencies must never appear in the published npm tarball. Both public and tooling lockfiles remain dependency-scanner inputs.

## Publish Source

npm provenance must come from the public package repository. Do not publish this package from the private monorepo, because npm rejects provenance bundles from private GitHub Actions source repositories.

## Release Checklist

1. Sync only this package directory into the public repository root.
2. Confirm `package.json` points to `git+https://github.com/d906090-rgb/n8n-nodes-franklab.git`.
3. Confirm the public repository is visible as public on GitHub.
4. Confirm `NPM_TOKEN` or a Trusted Publisher is configured for the public repository.
5. Run `npm ci --ignore-scripts`, then `npm run tooling:ci` in a clean public checkout.
6. Run build, test, scan, and inspect `npm pack --dry-run --json`; require zero `tooling/` or `dist/tooling/` tarball paths.
7. Run CI in the public repository.
8. Push the release tag `n8n-nodes-franklab-v<version>`.
9. Verify the npm package and run `npm run scan:published`.
