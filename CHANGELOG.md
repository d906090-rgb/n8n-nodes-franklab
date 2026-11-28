# Changelog

## 0.5.1 (2026-11-28)

n8n Verified Community Node English-only compliance:

- Translated two Russian module section comments in `nodes/shared/registry.ts` (`Social Networks` and `uniquification`) to English.
- Translated the voiceover sample text in `examples/ai-voiceover-video-assembly.workflow.json` to English.
- Added an automated metadata test guard ensuring zero non-Latin script characters appear in any source, documentation, or shipped example file.

## 0.5.0 (2026-11-25)

Full 16-action Midjourney contour on `JUPITER` and Economy Pool (`economy_rail`) draft routing:

- **JUPITER Midjourney (`midjourneyImage`, `getMidjourneyImageStatus`, `midjourneyVideo`, `getMidjourneyVideoStatus`)**: added `POST/GET /v1/images/midjourney(/:taskId)` and `POST/GET /v1/videos/midjourney(/:taskId)` supporting all 16 actions (`imagine`, `blend`, `describe`, `edits`, `upscale`, `variation`, `high-variation`, `low-variation`, `reroll`, `zoom`, `pan`, `inpaint`, `modal`, `video`, `remix-strong`, `remix-subtle`) and full action parameters (`image_urls`, `parent_task_id`, `index`, `custom_id`, `speed`, `version` `v6.1..v8.2`, `size`, `dimensions`, `quality`, `style`, `seed`, `stylize`, `chaos`, `weird`, `negative_prompt`, `zoom_ratio`, `direction`, `mask_url`, `batch_size`), while keeping legacy `youchuan*` operations distinct and backward-compatible.
- **Economy Pool (`economy_rail`) draft route selector**: added optional `execution_mode` (`direct` / `economy_rail`) strictly scoped to supported `/v1/*` operations on `JUPITER` (`omniImage`, `seedreamImage`, `geminiImage`), `MARS` (`textToVideo`, `imageToVideo`), `SATURN` (`video`, `turboTextToVideo`, `turboImageToVideo`), and `Hot Coffee` (`createVideo`, rejecting unsupported `video_extend` on `economy_rail`).
- **Client output extraction & `modal` polling**: `extractOutput()` resolves `imageUrl`, `video_url`/`videos[]` (`string[]` and `{ url }[]`), and preserves top-level `grid_image_url`, `images`, `videos`, `prompts`, `buttons`, and `modal_ready` without `data.result` shadowing; `poll()` treats `modal` as a terminal state for two-step `inpaint` → `modal` workflows; `defaultBodyOperation()` sets `operation: 'video'` on `jupiter.midjourneyVideo`.
- **SSRF & payload hygiene**: `url.ts` and `node-utils.ts` enforce public HTTP(S) SSRF checks on `string[]` `image_urls` (`*_urls` / `*Urls`) and `mask_url`, and omit empty `[]` multi-value defaults from request payloads.

## 0.4.0 (2026-11-23)

n8n Verified Community Node review compliance (single regular action node + `NodeApiError`):

- **Single unified `FrankLab` action node (`@apergrex/n8n-nodes-franklab.frankLab`)**: consolidated all 30 regular module nodes into one `FrankLab` node where every module (`Alibaba`, `Aries`, `C2PA`, `DOLA`, `FLUX`, `HeyGen Agent`, `HOLST`, `Hot Coffee`, `JUPITER`, `KLEY`, `KUSOK`, `MARS`, `MERCURY`, `MiniMax`, `MOON`, `Narezka`, `NEPTUNE`, `OMNI`, `ORKESTR`, `PLASTINKA`, `PLUTO`, `SATURN`, `Social`, `SUFLER`, `TextSticker`, `TITAN`, `VariantPack`, `VENUS`, `VOLNA`, `X`) is a top-level `Resource` with its operations and scoped fields underneath. Satisfies n8n's "one regular node per verified package" guideline.
- **`NodeApiError` for HTTP/API errors**: replaced `NodeOperationError` re-throws on HTTP failures with `NodeApiError` backed by structured `FrankLabHttpError`, preserving HTTP status code (`httpCode`), response body, and response headers in the n8n UI.
- Updated all 6 example workflow JSONs in `examples/` to use the unified `FrankLab` node with explicit `resource` parameters.

## 0.3.1 (2026-11-23)

n8n Verified Community Node scanner compliance (`@n8n/scan-community-package` 0 errors / 0 warnings, 100% backward-compatible operation values):

- Organized operations under explicit `Resource` selectors (`@n8n/community-nodes/resource-operation-pattern`) across all 11 multi-operation nodes with >5 operations: **DOLA**, **FLUX**, **HeyGen Agent**, **JUPITER**, **KUSOK**, **MARS**, **OMNI**, **SATURN**, **Social**, **TextSticker**, and **TITAN**.
- Removed resource-name repetition in **VOLNA** operation display labels (`@n8n/community-nodes/operation-name-repeats-resource`). All underlying operation `value` identifiers remain unchanged so existing workflows continue working without migration.

## 0.3.0 (2026-11-23)

Full Make.com P0 parity wave + Apergrex production domain support (30 nodes total):

- **Production origin (`apergrex.ru`)**: `FrankLabApi` credentials and URL validator now accept both `https://apergrex.ru/franklab/api` (`https://apergrex.ru`) and `https://franklab.ru/franklab/api` (`https://franklab.ru`), plus 3 ready-to-import starter workflows in `examples/`.
- **5 new P0 nodes**:
  - **FrankLab Social** (`frankLabSocial`): publish, poll status, manage releases, read insights, multipost with `Idempotency-Key`, and list accounts/boards/moderation channels/workspaces/brands/destinations across all 14 social networks (`youtube`, `instagram`, `tiktok`, `facebook`, `threads`, `pinterest`, `telegram`, `vk`, `linkedin`, `bluesky`, `wordpress`, `ok`, `yandex_zen`, `max`).
  - **FrankLab FLUX** (`frankLabFlux`): FLUX 3 Video (`t2v`, `i2v`, `v2v`, `draft_enhance`, `edit`) and FLUX 3 Image / Klein with closed-body validation, auto-quote `acceptedMaxFranks`, availability probes, and status polling.
  - **FrankLab Narezka** (`frankLabNarezka`): smart vertical clipping (`clips`) and highlight compilations (`compilation`) with cost estimation, source URL import, `Idempotency-Key` headers, and polling.
  - **FrankLab VariantPack** (`frankLabVariantPack`): batch 2–100 uniquely varied video copies with Make presets (`light`, `standard`, `stealth`, `speech`, `balanced`, `deep`, `custom`), AI captions, cost estimates, and brand/library pickers.
  - **FrankLab HeyGen Agent** (`frankLabHeyGenAgent`): prompt-to-video with 2-stage session→video polling, interactive chat sessions, message sending, resource retrieval, stop session, and pickers for saved credentials, avatar looks, voices, styles, brand kits, and glossaries.
- **8 upgraded existing nodes (Make parity)**:
  - **JUPITER**: added Nano Banana (Google Gemini Image), GPT Image 2 / Codex, and Youchuan Midjourney (image & video) + status routes.
  - **SATURN**: added Video Extend (`/v1/videos/video-extend`) and Multi-Image to Video (`/v1/videos/multi-image2video`) + status routes.
  - **VOLNA**: added ElevenLabs v4 / v4 Turbo, Google Gemini 3.8 / 3.8 Flash Lite TTS, BytePlus Seed Audio 1.0, xAI Grok TTS & STT, Google Gemini 3.5 STT, xAI Voice List, and ElevenLabs / xAI / Google voice RPCs.
  - **OMNI**: added `omni_1_2` model, `Quote Video`, `Quote Batch`, `Create Batch`, and `Get Batch Status` (with `partial_success` terminal handling).
  - **ALIBABA**: added Image models (`z-image-turbo`, `qwen-image-3.0`, `qwen-image-3.0-pro`, `wan2.7-image-pro`), Video models (`wan3.0-video-prime`, `happyhorse-1.1-r2v`, `happyhorse-1.0-video-edit`, `wan2.2-kf2v-flash`, `wan2.1-kf2v-plus`), and full video operations (`video_edit`, `keyframe_to_video`, `video_extend`, `file_to_video`, `link_to_video`).
  - **KLEY**: added `round`, `remove_bg`, `chroma_key`, `waveform`, `bria_video_replace_bg`, `bria_video_erase_object`, `variant_pack`, `quality_compare` montage operations and `overlayImageUrl` on `overlay`.
  - **PLASTINKA**: added `applySample` operation (`overlay`/`replace`/`fit` + `sampleId`) and `quality_compare` (`referenceAudioUrl`).
  - **KUSOK**: added `moonOperation` (`POST /make/kusok/operation`, `backend: 'moon'`) covering H5 verification (`verify_start`, `verify_get_result` with 409/410 status passthrough) and Seedance asset management (`create_asset`, `get_asset`, `list_assets`).

## 0.2.4 (2026-09-07)

Field-level parity on two existing nodes. No new nodes, no new credentials and no billing
change — both surfaces run through the same partner API key and the same server-side
reserve → confirm/refund as every other operation.

- ALIBABA (`Generate Video`): a `Video Model` dropdown — the default keeps the historical
  HappyHorse 1.1 body, alongside `WAN 3.0 Video` and the two explicit HappyHorse 1.1
  text-to-video / image-to-video values. WAN 3.0 unlocks `Audio`, `Prompt Extension` and
  `Watermark` toggles, a `Last Frame (FrankLab Asset)` on image-to-video, and a
  `Reference Images` list (1-10 FrankLab-hosted images) on reference-to-video, which
  HappyHorse rejects outright. `Image to Video` now takes a full `First Frame (FrankLab
  Asset)` descriptor (stored file ID, URL, MIME type, width, height, size in bytes) on
  both models, instead of the previous flat fields.
- ALIBABA (`Generate Image`): a `Qwen Operation` toggle (`Text to Image` / `Image Edit`)
  and `Edit Image IDs` (1–3 FrankLab stored-file UUIDs).
- C2PA: new `Verify Asset` operation backed by `POST /franklab/c2pa/verify`. It takes a
  public HTTPS `Media URL` and returns a Content Credentials verdict (`Valid`, `Trusted`,
  `Invalid`, `Unknown` or `NoManifest`). The check is synchronous and free: there is no
  task to poll, no cost field, and the asset is read, reported on and discarded rather
  than stored.

## 0.2.3 (2026-09-06)

KLEY and PLASTINKA gain the operations that FrankLab's pinned FFmpeg 8.1.2 build could
already perform but never exposed. No new credentials, no new routes, no billing change —
these run through the same partner API key and the same server-side reserve →
confirm/refund as every other operation.

- KLEY (`Montage Operation`): `Stabilize` (two-pass vidstab), `Scene List` (scene-change
  detection with an optional contact sheet), `QC Report` (black / freeze / silence / crop /
  loudness in one pass), `Split Screen` (2–4 sources), `Slow Motion` (motion-compensated
  interpolation), `Denoise`, `HDR to SDR`, `Animated Loop` (WebP/AVIF) and
  `Mezzanine Master` (ProRes / DNxHR).
- PLASTINKA (`Audio Operation`): `Analyze` (EBU R128 loudness + level statistics),
  `Spectrogram`, `Waveform Image`, `Fingerprint` (Chromaprint), `Enhance Dialogue` and
  `Stereo Tools`; `Convert` also accepts ALAC and Opus.

Analysis-only operations (`Scene List`, `QC Report`, `Analyze`, `Fingerprint`) return a
report and produce no downloadable file.


## 0.2.0 (2026-09-04)

Full Make-parity wave: 12 new nodes covering every published FrankLab Make module from the
«Franklab» (generations) and «Franklab montage» (utilities) custom apps, all billed through
the same partner API key and reserve → confirm/refund server billing as Make.

- New nodes: SUFLER (subtitles), TextSticker (overlays + studio option lists), ORKESTR
  (music v1 Suno envelope + ORKESTR v2 incl. Google Lyria), JUPITER (omni-image + seedream),
  MARS (text/image to video, effects, motion control), SATURN (SATURN, SATURN Turbo, omni),
  MOON (cinematic video + cost estimate), VENUS (talking avatar videos), X (xAI Imagine
  video/image), MiniMax (H3 videos, idempotency keys, task actions), DOLA (MOON GPT text
  generation + files), Alibaba (Z-Image images, HappyHorse videos, estimates).
- Client: DELETE method support (DOLA file deletion), polling carries `billing_task_id`,
  task id is also derived from `billing_task_id`, and make/orkestr v1 requests are wrapped
  into the `{ operation, payload }` envelope.
- The public-mirror export (`scripts/export-n8n-nodes-franklab-public-repo.mjs --out`) now
  rewrites `scripts.test` to plain `node --test` so the mirror CI keeps working without the
  monorepo host-lock wrapper (which stays mandatory inside the monorepo).
- Slice 3 (remaining live surfaces): new MERCURY (lip-sync compat/advanced + face
  identification), NEPTUNE (TTS + voices), PLUTO (text-to-audio / video-to-audio), ARIES
  (try-on status polling; submissions retired server-side), TITAN (staged multi-element video selection flow), and Hot
  Coffe (ModelArk images + Seedance videos) nodes; KUSOK gained the Kling element/voice
  library v1 surface (element tags/voices, advanced presets, custom voice CRUD).
  Kling video generation runs exclusively through SATURN (Kling 3.0 Omni) and MARS
  (Kling 3.0).
- Slice 2 (KUSOK/OMNI/SPEKTR/VECTOR closure): new OMNI node — the Google provider surface
  (Gemini Omni Flash / Veo 3 via `make/omni`, the v1 omni-video route, and the Google
  subscription rails `videos/google-sub` + `images/google-sub`), moved out of the
  Kling-backed SATURN node; new KUSOK node — element library (sync/async), video
  recognition, voice library and preset voices (requires a Kusok-capable partner key);
  Recraft create/status operations added to JUPITER (closes the real SPEKTR gap together
  with six BRIA image operations added to HOLST; VECTOR was already covered by the MARS
  motion-control surface).
- Independent-audit fixes: node payloads now match the server DTOs exactly — MARS sends
  `image` (not `image_url`) for image-to-video and exposes the real Video Effects fields
  (`effect_scene`, `effect`, `image`, `image_tail`) and Motion Control reference frame +
  duration; VENUS sends `image`/`sound_file`; SATURN omni wraps `video_url` into
  `video_list`; ORKESTR v1 Suno operations are per-endpoint enums and v1 submits never
  poll; MiniMax Task Action accepts a Job/Task ID and List Videos supports
  `page_num`/`page_size` query parameters; required server fields are marked required in
  the UI; `package-metadata` accepts both monorepo and standalone `scripts.test` forms.

## 0.1.2 (2026-06-04)

Public-repo-only fix: ignore hidden optional node parameters during lint verification.

## 0.1.1 (2026-06-04)

Add npm author email metadata required by the npm publish step.

## 0.1.0 (2026-06-03)

First wave: HOLST, KLEY, PLASTINKA, VOLNA, and C2PA signer-profile nodes with the shared
registry-driven client, SSRF-locked media URLs, redaction, and offline contract tests.
