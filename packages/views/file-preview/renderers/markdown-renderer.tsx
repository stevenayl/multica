"use client";

import { useEffect, useState } from "react";
import { Markdown } from "../../common/markdown";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

type State =
  | { kind: "loading" }
  | { kind: "ready"; text: string }
  | { kind: "error" };

export function MarkdownRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) =>
        res.ok ? res.text() : Promise.reject(new Error(String(res.status))),
      )
      .then((text) => {
        if (!cancelled) setState({ kind: "ready", text });
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
    <div className="h-full w-full overflow-auto p-6">
      <Markdown mode="full">{state.text}</Markdown>
    </div>
  );
}
