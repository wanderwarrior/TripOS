"use client";

import { useState, useTransition } from "react";
import { Film, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import { updateHeroMediaAction } from "@/server/actions/platform";

export function HeroVideoSettings({
  initialVideoUrl,
  initialPosterUrl,
}: {
  initialVideoUrl: string;
  initialPosterUrl: string;
}) {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [posterUrl, setPosterUrl] = useState(initialPosterUrl);
  const [pending, startTransition] = useTransition();

  const dirty =
    videoUrl.trim() !== initialVideoUrl.trim() ||
    posterUrl.trim() !== initialPosterUrl.trim();

  function save() {
    startTransition(async () => {
      try {
        await updateHeroMediaAction({
          videoUrl: videoUrl.trim(),
          posterUrl: posterUrl.trim(),
        });
        toast.success("Hero video saved — it's live on the landing page.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <div className="tc-card">
      <div className="tc-card-head">
        <div className="ttl">
          <Film />
          <h3>Landing-page hero video</h3>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="tc-btn tc-btn-primary tc-btn-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </button>
      </div>

      <div className="grid gap-6 p-[18px] md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Video</Label>
            <VideoUpload
              value={videoUrl || null}
              onChange={(url) => setVideoUrl(url ?? "")}
              label="Click or drop a video to upload"
            />
            <details className="group">
              <summary className="cursor-pointer list-none text-[11.5px] text-muted transition-colors hover:text-gold-deep">
                Or paste a hosted URL instead
              </summary>
              <Input
                id="hero-video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://cdn.example.com/hero.mp4"
                spellCheck={false}
                className="mt-2"
              />
            </details>
            <p className="text-[11.5px] leading-relaxed text-muted">
              Upload an MP4/WebM, or point at a CDN-hosted file (more durable in
              production). Leave empty to fall back to the bundled default +
              animated aurora.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Poster image</Label>
            <ImageUpload
              value={posterUrl || null}
              onChange={(url) => setPosterUrl(url ?? "")}
              label="Click or drop a poster frame"
            />
            <p className="text-[11.5px] leading-relaxed text-muted">
              Shown while the video loads and to{" "}
              <span className="mono">prefers-reduced-motion</span> visitors (who
              never see the video).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative aspect-video overflow-hidden rounded-[10px] border border-line bg-inkwash">
            {videoUrl.trim() ? (
              <video
                key={videoUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={posterUrl.trim() || undefined}
                src={videoUrl.trim()}
              />
            ) : posterUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl.trim()}
                alt="Hero poster preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="marketing-hero-aurora absolute inset-0 flex items-center justify-center">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                  Default aurora
                </span>
              </div>
            )}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,20,0.45)_0%,rgba(8,14,20,0.7)_100%)]"
            />
          </div>
          <p className="text-[11.5px] leading-relaxed text-muted">
            This is roughly how it reads behind the hero headline (a dark scrim
            sits over it for text legibility).
          </p>
        </div>
      </div>
    </div>
  );
}
