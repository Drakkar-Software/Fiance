/**
 * The prerendered loading indicator stands down.
 *
 * The indicator is HTML and CSS in app/+html.tsx: it has to appear BEFORE the
 * bundle, so it cannot be a React component — but React is what knows when it
 * is no longer needed. Marking <html> hides it through the prerender's own
 * stylesheet; no node is removed from the document.
 */

/** Hands over to the app. No-op off the web, and idempotent. */
export function dismissLoadingIndicator(): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-app-mounted", "");
}
