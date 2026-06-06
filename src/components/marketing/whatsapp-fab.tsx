import { MessageCircle } from "lucide-react";

// Floating "chat with us on WhatsApp" button for the marketing surface. Renders
// only when NEXT_PUBLIC_SUPPORT_WHATSAPP is set (so it's never a dead link).
// On-brand for a WhatsApp-first product and a low-friction contact path.
export function WhatsappFab() {
  const num = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "").replace(
    /[^\d]/g,
    ""
  );
  if (!num) return null;
  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
