# @apergrex/n8n-nodes-franklab

Official FrankLab community nodes for n8n.

FrankLab is a first-party media automation API for image processing, video post-production, audio processing, voice generation, dubbing, and content credential profile management. This package integrates one service: the FrankLab API at `https://franklab.ru/franklab/api`.

## What This Package Contains

This repository is the public n8n connector package only. It contains:

- n8n node definitions for HOLST, KLEY, PLASTINKA, VOLNA, C2PA, SUFLER, TextSticker, ORKESTR, JUPITER, MARS, SATURN, MOON, VENUS, X, MiniMax, DOLA, Alibaba, OMNI, KUSOK, MERCURY, NEPTUNE, PLUTO, ARIES, TITAN, and Hot Coffe (25 nodes). Kling runs exclusively through the SATURN node (Kling 3.0 Omni) and the MARS node (Kling 3.0).
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
- Supported image operations include resize, crop, format conversion, watermark, image overlay, text, filters, rotate, flip, blur, sharpen, mask, metadata read/write, collage, adjust, GPS metadata removal, and the BRIA operations (remove/replace background, erase foreground, erase by text, product lifestyle by text, product cutout).

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

### SUFLER

- Burn styled subtitles into a video with the v1 or v2 caption engine.
- Optional template, language, transcription engine, highlight mode, platform, and safe zone preset.
- Job status polling. Advanced styling fields (glossary, emphasis, render modes, translation) go through `Additional JSON`.

### TextSticker

- Overlay text, stickers, emojis, and images on a video.
- Job status polling.
- Studio option lists: fonts, stickers, emojis, subtitle templates, video effects, transitions, transition sounds, safe zone options, aspect ratios, resize presets.

### ORKESTR

- V1 (Suno envelope): music, lyrics, style, persona, processing, visuals, and task status polling by poll kind.
- V2: generate, extend, upload cover, upload extend, add instrumental, add vocals, replace section, mashup, lyrics, timestamped lyrics, separate vocals, generate MIDI, convert WAV, music video, cover image, boost style, generate persona, Lyria music (Google Lyria), and task status.
- V1 submits do not auto-poll; use `Get Task Status` with the matching poll kind. V2 submits support `Wait for Completion`.

### JUPITER

- Generate images with omni-image (generate/edit modes, quality, output format, aspect ratio, series) or seedream.
- Recraft tasks (create + status) for background removal and similar image operations.
- Task status polling per endpoint.

### MARS

- Text to video and image to video (image passed as a public URL in the `image` field).
- Video effects (`effect_scene`, `effect`, `image`, optional `image_tail`) and motion control (reference frame + video + duration).
- Per-endpoint task status polling.

### SATURN

- SATURN (Kling 3.0 Omni) video generation and SATURN Turbo text/image to video. Kling traffic runs only here and in MARS (Kling 3.0).
- Per-endpoint task status polling. The Google-backed omni video routes live in the OMNI node.

### MOON

- Submit cinematic video tasks (text/image/reference to video, video edit/extend) with model, duration, ratio, and resolution presets.
- Estimate the cost of a task before submitting.
- Task status polling.

### VENUS

- Generate talking-avatar videos from a portrait image plus an audio URL or audio id.
- Task status polling.

### X

- Generate videos with xAI Imagine (Grok text/reference/edit/extend/single-image modes).
- Generate images with xAI Imagine.
- Per-endpoint task status polling.

### MiniMax

- Submit MiniMax H3 video tasks with idempotency keys, scenario, resolution, duration, ratio, and stored-file first frames.
- Mint idempotency keys, list video tasks (with `page_num`/`page_size` pagination), and cancel or delete tasks by task ID.
- Task status polling (long-poll `wait_seconds` is not used; standard polling applies).

### DOLA

- Generate text (and structured JSON with `json_object`/`json_schema` response formats) with MOON GPT models.
- Async mode returns a billing task id you can poll with `Get Task`.
- Import files from public URLs, list files, get a file, delete a file, and list models.
- Streaming generation and direct multipart file upload are not part of the public package.

### OMNI

- Google-backed video generation (distinct provider from Kling-backed SATURN): Gemini Omni Flash and Omni Flash 1.1, Veo 3 and Veo 3 Fast.
- Text/image/reference to video plus edit and extend operations with model, duration, resolution, and aspect ratio presets.
- The v1 omni-video route and the Google subscription rails (`videos/google-sub`, `images/google-sub`) with per-rail status polling.
- Provider info lookup and task status polling.

### KUSOK

- Element library: create (sync and async), list, get, delete.
- Portrait/image recognition (sync and async) with async task polling.
- Voice library: create, list, get, delete, and preset voices.
- Requires a Kusok-capable partner API key; legacy keys are rejected server-side.

### MERCURY

- Lip-sync a video to speech audio (compat and advanced modes).
- Face identification on images.
- Per-endpoint task status polling.

### NEPTUNE

- Generate speech from text with optional voice and model.
- Voice list lookup and task status polling.

### PLUTO

- Generate audio from a text prompt or produce audio for an existing video.
- Per-endpoint task status polling.

### ARIES

- Kolors virtual try-on task status polling. New try-on submissions are retired server-side (the route answers 410 Gone); use Get Status for tasks submitted earlier.

### TITAN

- Staged multi-element video composition: initialize, add, delete, clear, and preview element selections, then create the video.
- Task list and task status polling.

### Hot Coffe

- Generate images and Seedance videos (ByteDance ModelArk) with operation, model variant, resolution, duration, and ratio presets.
- Per-surface task status polling.

### Alibaba

- Generate images with Alibaba Z-Image (synchronous).
- Submit HappyHorse videos (text/image to video) and estimate task cost before submitting.
- Task status polling.
- Availability depends on the FrankLab server-side Alibaba rollout flag; requests fail closed until it is enabled for your key.

## Usage Notes

All media inputs in public v1 are URL-only. Use public `http` or `https` URLs. Local URLs such as localhost, loopback/link-local IPs, metadata hosts, and file paths are rejected.

Most submit operations return a `taskId`. Enable `Wait for Completion` to poll until FrankLab returns a terminal status, or use the matching status operation later in the workflow.

For advanced request fields, use `Additional JSON`. Keep media URLs public and never paste secrets, private keys, PEM files, or provider credentials into workflow fields.

Multipart upload endpoints (MiniMax media upload, DOLA direct file upload) are intentionally not exposed: pass media by public URL, data URL, or partner-scoped stored file id instead, matching the URL-only media policy of the package.

## Development

The public repository is self-contained but deliberately separates publishable package dependencies from its private build toolchain. From a clean clone, install both deterministic contours before running package commands:

```bash
npm ci --ignore-scripts
npm run tooling:ci
npm run build
npm test
npm run scan
```

`tooling` is marked `private:true`; it exists only for build, lint, test, and release commands. The publishable package remains override-free with no runtime dependencies, and the private tooling directory is excluded from the npm tarball.

## Compatibility

The package is built with the official `n8n-node` tool. The private development contour currently pins `@n8n/node-cli@0.46.2` for reproducible community verification.

Development and CI use Node.js 24. The package declares `node >=20.19` because the current n8n toolchain requires a Node 20 build with modern ESM interop or newer.

The verified package has no runtime dependencies. Development dependencies are used only for build, lint, release, and local tests.

## Verification

- `npm run tooling:ci`: clean-install the private development toolchain and link its canonical eslint export into the public development tree.
- `npm run build`: compile and copy n8n node assets.
- `npm test`: run package metadata, registry, client, and leakage tests.
- `npm run scan`: run local n8n lint plus `npm pack --dry-run`.
- `npm run scan:published`: run the official n8n published-package scanner after the package is published to npm with provenance.

## Public Release Repository

This repository is intended to be public so npm provenance can be verified by GitHub Actions. The npm package is published from this public package repository, not from the private FrankLab monorepo.

Recommended release flow:

1. Merge package changes in the private FrankLab monorepo.
2. Export or sync only `integrations/n8n-nodes-franklab` into the public `d906090-rgb/n8n-nodes-franklab` repository.
3. Review the public repository file list before pushing, including the tracked private tooling manifest and lockfile but no `node_modules`.
4. From a clean public checkout, run `npm ci --ignore-scripts`, `npm run tooling:ci`, build, test, scan, and inspect the dry-run tarball for zero tooling paths.
5. Push the release tag to the public repository.
6. Let the public GitHub Actions publish workflow run `npm run release` with npm provenance.
7. Verify the published package with `npm run scan:published`.

## Resources

- [FrankLab Cookbook](https://franklab.ru/franklab/cookbook)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Submit n8n community nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
- [n8n community node verification guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/)
- [Public package repository](https://github.com/d906090-rgb/n8n-nodes-franklab)

## Version History

- `0.2.3`: KLEY and PLASTINKA capability operations on the pinned FFmpeg 8.1.2 build — stabilize, scene list, QC report, split screen, slow motion, denoise, HDR→SDR, animated loop, mezzanine master; analyze, spectrogram, waveform image, fingerprint, enhance dialogue, stereo tools, plus ALAC/Opus convert targets.
- `0.2.0`: Full Make-parity wave — 20 new nodes (SUFLER, TextSticker, ORKESTR, JUPITER, MARS, SATURN, MOON, VENUS, X, MiniMax, DOLA, Alibaba, OMNI, KUSOK, MERCURY, NEPTUNE, PLUTO, ARIES, TITAN, Hot Coffe), Recraft/BRIA operations, Kling element/voice library in KUSOK, DELETE support, `billing_task_id` polling, and a standalone `scripts.test` rewrite in the public-mirror export.
- `0.1.2`: Public-repo lint fix for hidden optional node parameters.
- `0.1.1`: npm author email metadata.
- `0.1.0`: First-wave package scaffold for HOLST, KLEY, PLASTINKA, VOLNA, and C2PA.
