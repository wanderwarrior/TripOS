# Marketing hero video

The landing-page hero ([src/components/marketing/hero.tsx](../../src/components/marketing/hero.tsx))
plays a looping background video from this folder. Until you add the file, the
hero falls back to an animated "aurora" gradient (see `.marketing-hero-aurora`
in `src/app/globals.css`), so the page already looks finished.

Drop these in `public/videos/` to enable the video:

| File               | Required | Notes                                                        |
| ------------------ | -------- | ------------------------------------------------------------ |
| `hero.mp4`         | yes      | H.264/AAC. The main source.                                  |
| `hero.webm`        | optional | VP9/Opus — smaller, served first to browsers that support it. Listed second in the markup; reorder the `<source>`s if you want webm preferred. |
| `hero-poster.jpg`  | optional | First-frame still shown while the video buffers.             |

## Recommended encode

- **Content:** slow, ambient travel b-roll (aerial coastlines, dunes, city at
  dusk). Avoid hard cuts — it loops. The hero applies a dark navy scrim, so
  bright, slightly desaturated footage reads best behind the white headline.
- **Length:** 10–20s seamless loop.
- **Resolution:** 1920×1080 (or 1280×720 for a lighter file).
- **Size:** keep `hero.mp4` under ~3–5 MB so it autoplays fast on mobile.
- **No audio track** needed (the player is muted).

Example (ffmpeg), trim 0–16s, mute, compress:

```bash
ffmpeg -i source.mov -an -t 16 -vf "scale=1920:-2,fps=30" \
  -c:v libx264 -profile:v high -crf 26 -pix_fmt yuv420p -movflags +faststart \
  public/videos/hero.mp4

ffmpeg -i source.mov -an -t 16 -vf "scale=1920:-2,fps=30" \
  -c:v libvpx-vp9 -b:v 0 -crf 34 public/videos/hero.webm

ffmpeg -i public/videos/hero.mp4 -frames:v 1 public/videos/hero-poster.jpg
```

The video is muted + `playsInline` so mobile browsers autoplay it.
Reduced-motion users never download it — they see the static aurora instead.
