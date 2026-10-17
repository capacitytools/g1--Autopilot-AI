"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getConfig } from "@/lib/config";

/**
 * Registration button that redirects users to G1-ID signup.
 *
 * Why a client component:
 * - We append the current Autopilot URL as a `redirect` query param so
 *   G1-ID can send the user back after registration (once G1-ID supports
 *   it — see G1-ID handoff §4.2 "Missing interfaces").
 * - `window.location.origin` is only available client-side.
 *
 * Until G1-ID supports the redirect param, the link still works — it
 * just lands the user on G1-ID's home page and they navigate manually.
 */
export function G1IDRegisterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [finalHref, setFinalHref] = useState(href);

  useEffect(() => {
    try {
      const config = getConfig();
      const url = new URL(href);
      // Only append redirect for our own configured G1-ID URL.
      // This prevents accidentally leaking the current URL to a
      // different host if `href` was ever mis-supplied.
      if (url.origin === new URL(config.g1id.url).origin) {
        url.searchParams.set("redirect", window.location.origin);
        setFinalHref(url.toString());
      }
    } catch {
      // If anything fails, fall back to the original href.
      setFinalHref(href);
    }
  }, [href]);

  return (
    <a
      href={finalHref}
      className={className}
      rel="noopener noreferrer"
      // Note: we intentionally do NOT use target="_blank".
      // Registration is a primary action — a same-tab redirect is
      // the expected, less surprising behavior on mobile.
    >
      {children}
    </a>
  );
}