# Changelog

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
