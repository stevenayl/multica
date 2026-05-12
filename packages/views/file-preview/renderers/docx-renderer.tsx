"use client";

import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

export function DocxRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;
    fetch(url)
      .then((res) =>
        res.ok ? res.blob() : Promise.reject(new Error(String(res.status))),
      )
      .then((blob) =>
        renderAsync(blob, container, undefined, {
          className: "docx-preview",
          inWrapper: true,
        }),
      )
      .then(() => {
        if (!cancelled) setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="h-full w-full overflow-auto bg-muted/20 p-4">
      {state === "loading" && (
        <div className="text-sm text-muted-foreground">
          {t(($) => $.file_preview.loading)}
        </div>
      )}
      {state === "error" && (
        <div className="text-sm text-destructive">
          {t(($) => $.file_preview.load_failed)}
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
