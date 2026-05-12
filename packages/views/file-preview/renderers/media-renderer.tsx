"use client";

import { useMemo } from "react";
import type { RendererProps } from "../types";
import { getRendererKey } from "../get-renderer";

export function MediaRenderer({ url, filename }: RendererProps) {
  const kind = useMemo(() => getRendererKey(filename), [filename]);
  return (
    <div className="flex h-full w-full items-center justify-center bg-black p-4">
      {kind === "video" ? (
        <video src={url} controls className="max-h-full max-w-full" />
      ) : (
        <audio src={url} controls className="w-full max-w-md" />
      )}
    </div>
  );
}
