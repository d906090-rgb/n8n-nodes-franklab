# @apergrex/n8n-nodes-franklab

Official FrankLab community nodes for n8n.

FrankLab is a first-party media automation API for image processing, video post-production, audio processing, voice generation, dubbing, and content credential profile management. This package integrates one service: the FrankLab API at `https://franklab.ru/franklab/api`.

## What This Package Contains

This repository is the public n8n connector package only. It contains:

- n8n node definitions for HOLST, KLEY, PLASTINKA, VOLNA, and C2PA.
- FrankLab API credential definition.
- A small request client that calls the public FrankLab API with your API key.
- Tests, examples, and GitHub Actions workflows for n8n community-node verification and npm provenance publishing.

It does not contain FrankLab backend source code, provider integrations, provider API keys, `.env` files, billing internals, partner-admin routes, database schema, MCP tooling, or private Make.com module sources.

## API Key And Price List

You need a FrankLab API key before these nodes can run jobs.

To request an API key, current pricing, and onboarding details, contact:

- Email: `fedorchuk.a@apergrex.com`
- Telegram: `@ReanimatorXP`

Please mention that you want to use `@apergrex/n8n-nodes-franklab` in n8n. FrankLab will provide the API key and the current price list or commercial terms for your use case.

## Billing

The n8n package does not calculate prices, hold balances, or bill customers locally. Billing and access control happen on the FrankLab API side:

1. n8n sends your API key with each request.
2. FrankLab identifies the account, partner, or workspace behind that key.
3. FrankLab validates access and available limits or balance.
4. FrankLab creates the job and applies the server-side billing rules.
5. Where supported, responses include cost fields such as `final_cost_franks`, `cost_currency`, `cost_status`, and `cost_unit`.

For production use, request your API key and current price list before building workflows that generate paid media jobs.

## Installation

Install the package through n8n community nodes:

```text
@apergrex/n8n-nodes-franklab
```

Follow the official [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) if your n8n instance has not installed community nodes before.

## Credentials

Create a FrankLab credential in n8n after installation.

The credential has two fields:

- `API Key`: your FrankLab API key.
- `Base URL`: fixed to `https://franklab.ru/franklab/api` or `https://franklab.ru`.

The public package does not support custom hosts, local hosts, DNS overrides, or test-host switches.

## Cookbook

Use the FrankLab Cookbook for workflow examples and field-level guidance:

https://franklab.ru/franklab/cookbook

The cookbook includes Make.com and n8n editions. Use the platform switch in the cookbook to move between versions.

## Operations

### HOLST

- Submit an image processing job.
- Poll an image job status.
- Supported image operations include resize, crop, format conversion, watermark, image overlay, text, filters, rotate, flip, blur, sharpen, mask, metadata read/write, collage, adjust, and GPS metadata removal.

### KLEY

- Montage operations.
- Video speed changes.
- Subtitle rendering.
- Video overlays.
- Job status polling.

### PLASTINKA

- Audio processing.
- Save a reusable audio sample from a public HTTPS URL.
- List audio samples.
- Apply a saved sample to a video.
- Job status polling.

### VOLNA

- Text to speech.
- Text to dialogue, turbo TTS, and Google 3.1 TTS.
- Speech to text.
- Sound effects.
- Audio isolation.
- Voice clone.
- Voice design.
- Save a designed voice.
- Dubbing.
- Voice, model, usage, and task lookups.

### C2PA

- List signer profiles.
- Generate a self-signed signer profile.
- Revoke a signer profile.
- Load profile options for other FrankLab nodes.

Public verified v1 intentionally excludes private key import and private key rotation flows.

## Usage Notes

All media inputs in public v1 are URL-only. Use public `http` or `https` URLs. Local URLs such as localhost, loopback/link-local IPs, metadata hosts, and file paths are rejected.

Most submit operations return a `taskId`. Enable `Wait for Completion` to poll until FrankLab returns a terminal status, or use the matching status operation later in the workflow.

For advanced request fields, use `Additional JSON`. Keep media URLs public and never paste secrets, private keys, PEM files, or provider credentials into workflow fields.

## Compatibility

The package is built with the official `n8n-node` tool and `@n8n/node-cli >= 0.23.0`.

Development and CI use Node.js 24. The package declares `node >=20.19` because the current n8n toolchain requires a Node 20 build with modern ESM interop or newer.

The verified package has no runtime dependencies. Development dependencies are used only for build, lint, release, and local tests.

## Verification

- `npm run build`: compile and copy n8n node assets.
- `npm test`: run package metadata, registry, client, and leakage tests.
- `npm run scan`: run local n8n lint plus `npm pack --dry-run`.
- `npm run scan:published`: run the official n8n published-package scanner after the package is published to npm with provenance.

## Public Release Repository

This repository is intended to be public so npm provenance can be verified by GitHub Actions. The npm package is published from this public package repository, not from the private FrankLab monorepo.

Recommended release flow:

1. Merge package changes in the private FrankLab monorepo.
2. Export or sync only `integrations/n8n-nodes-franklab` into the public `d906090-rgb/n8n-nodes-franklab` repository.
3. Review the public repository file list before pushing.
4. Push the release tag to the public repository.
5. Let the public GitHub Actions publish workflow run `npm run release` with npm provenance.
6. Verify the published package with `npm run scan:published`.

## Resources

- [FrankLab Cookbook](https://franklab.ru/franklab/cookbook)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Submit n8n community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [n8n community node verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/)
- [Public package repository](https://github.com/d906090-rgb/n8n-nodes-franklab)

## Version History

- `0.1.0`: First-wave package scaffold for HOLST, KLEY, PLASTINKA, VOLNA, and C2PA.
