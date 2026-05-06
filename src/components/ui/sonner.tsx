"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-line bg-white shadow-lift text-ink",
          title: "font-medium text-navy",
          description: "text-muted-foreground",
          actionButton: "bg-navy text-ivory rounded-xl",
          cancelButton: "bg-ivory text-navy rounded-xl",
        },
      }}
    />
  );
}
