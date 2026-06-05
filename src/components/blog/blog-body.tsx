import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { BlogBlock } from "@/lib/blog-content";

// Renders blog content blocks to JSX. Supports a tiny inline syntax inside
// paragraph/list text: **bold** and [label](/internal-or-https-link).

const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      const cls =
        "text-gold-deep underline underline-offset-2 hover:text-ink transition-colors";
      nodes.push(
        href.startsWith("/") ? (
          <Link key={`${keyPrefix}-${i}`} href={href} className={cls}>
            {m[1]}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-${i}`}
            href={href}
            className={cls}
            rel="noopener"
          >
            {m[1]}
          </a>
        )
      );
    } else if (m[3]) {
      nodes.push(
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {m[3]}
        </strong>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        const k = `b-${i}`;
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={k}
                className="font-display text-2xl md:text-3xl text-ink leading-tight pt-4"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={k} className="font-display text-xl text-ink leading-tight pt-2">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={k} className="text-[15px] md:text-base text-ink/80 leading-relaxed">
                {renderInline(b.text, k)}
              </p>
            );
          case "ul":
            return (
              <ul key={k} className="space-y-2.5 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-[15px] md:text-base text-ink/80 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                    <span>{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={k} className="space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3.5 text-[15px] md:text-base text-ink/80 leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-inkwash text-[var(--on-dark)] text-xs font-medium tabular-nums">
                      {j + 1}
                    </span>
                    <span className="pt-0.5">{renderInline(it, `${k}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={k}
                className="border-l-2 border-[var(--gold-line)] pl-4 italic text-ink/75"
              >
                {renderInline(b.text, k)}
              </blockquote>
            );
          case "callout":
            return (
              <div
                key={k}
                className="rounded-lg border border-[var(--gold-line)] bg-gold-soft p-4 flex items-start gap-3"
              >
                <Lightbulb className="h-4 w-4 text-gold-deep mt-0.5 shrink-0" />
                <p className="text-sm md:text-[15px] text-ink leading-relaxed">
                  {renderInline(b.text, k)}
                </p>
              </div>
            );
          case "cta":
            return (
              <div
                key={k}
                className="rounded-lg border border-line bg-paper-2 p-5 mt-2 flex flex-wrap items-center justify-between gap-4"
              >
                {b.text ? (
                  <p className="text-sm text-ink/80">{b.text}</p>
                ) : (
                  <span />
                )}
                <Link
                  href={b.href}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-5 py-2.5 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
                >
                  {b.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
