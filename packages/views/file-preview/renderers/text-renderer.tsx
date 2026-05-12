"use client";

import { useEffect, useState } from "react";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

const MAX_BYTES = 1_000_000;

type State =
  | { kind: "loading" }
  | { kind: "ready"; text: string; truncated: boolean }
  | { kind: "error" };

export function TextRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        const truncated = blob.size > MAX_BYTES;
        const slice = truncated ? blob.slice(0, MAX_BYTES) : blob;
        return { text: await slice.text(), truncated };
      })
      .then((out) => {
        if (!cancelled) setState({ kind: "ready", ...out });
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
  return (
    <pre className="h-full w-full overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed">
      {state.text}
      {state.truncated ? `\n\n--- ${t(($) => $.file_preview.truncated)} ---` : ""}
    </pre>
  );
}
