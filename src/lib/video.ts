// Helpers for treating a YouTube link as a background "video". YouTube doesn't
// expose a raw MP4, so we can't use a bare <video> — instead we embed the
// privacy-friendly nocookie player muted + looping with all chrome hidden,
// which autoplays and reads like a background video. Direct MP4/WebM URLs
// (e.g. uploaded to R2) still use a real <video> elsewhere.

/** Extract the 11-char video id from common YouTube URL forms, else null. */
export function parseYouTubeId(url: string | null | undefined): string | null {
  const u = url?.trim();
  if (!u) return null;
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = u.match(re);
    if (m) return m[1];
  }
  return null;
}

/** True if the URL is a recognised YouTube link. */
export function isYouTubeUrl(url: string | null | undefined): boolean {
  return parseYouTubeId(url) !== null;
}

/** Build a muted, looping, chrome-free embed URL for use as a background. */
export function youTubeBackgroundEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id, // required for `loop` to work on a single video
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3", // hide annotations
    disablekb: "1",
    fs: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
