"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const trackedPath = (pathname: string) => pathname === "/works" || pathname === "/artists" || pathname.startsWith("/artists/");

function createTrackingId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replaceAll("-", "");
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PublicEngagementTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!trackedPath(pathname)) return;

    const trackingId = createTrackingId();
    const startedAt = Date.now();
    let maxScrollDepth = 0;
    let finished = false;

    const updateScrollDepth = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 100;
      maxScrollDepth = Math.max(maxScrollDepth, Math.min(Math.round(depth), 100));
    };

    const send = (duration: number | null) => {
      const payload = JSON.stringify({
        trackingId,
        path: pathname,
        duration,
        maxScrollDepth,
        userAgent: navigator.userAgent,
        referer: document.referrer || null,
      });
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon("/api/access-log", blob)) {
        void fetch("/api/access-log", { method: "POST", body: payload, headers: { "content-type": "application/json" }, keepalive: true });
      }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      updateScrollDepth();
      send(Math.max(Math.round((Date.now() - startedAt) / 1000), 0));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") finish();
    };

    updateScrollDepth();
    window.addEventListener("scroll", updateScrollDepth, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", finish);
    send(null);

    return () => {
      window.removeEventListener("scroll", updateScrollDepth);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", finish);
      finish();
    };
  }, [pathname]);

  return null;
}