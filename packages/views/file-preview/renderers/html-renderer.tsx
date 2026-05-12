"use client";

import { useEffect, useState } from "react";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

type State =
  | { kind: "loading" }
  | { kind: "ready"; html: string }
  | { kind: "error" };

export function HtmlRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((html) => {
        if (!cancelled) setState({ kind: "ready", html });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state.kind === "loading") {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t(($) => $.file_preview.loading)}
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="p-4 text-sm text-destructive">
        {t(($) => $.file_preview.load_failed)}
      </div>
    );
  }

  // Empty `sandbox` attribute = strictest sandbox: no scripts, no top
  // navigation, no forms, no same-origin. Safe for arbitrary HTML.
  return (
    <iframe
      sandbox=""
      srcDoc={state.html}
      className="h-full w-full border-0 bg-white"
    />
  );
}
