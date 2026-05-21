"use client";

import { useEffect } from "react";

/**
 * Warns the user before they leave a page with unsaved form edits.
 *
 * Covers the browser-level exits (tab close, reload, address-bar
 * navigation) via the `beforeunload` event. In-app `<Link>` navigations
 * are a separate concern the Next App Router doesn't expose a clean hook
 * for in 14.x — `beforeunload` catches the cases where data loss actually
 * hurts most (accidental reload / close).
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Modern browsers show their own generic message; returnValue must
      // be set for the prompt to appear.
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
