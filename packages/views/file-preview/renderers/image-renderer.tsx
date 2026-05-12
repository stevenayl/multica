"use client";

import type { RendererProps } from "../types";

export function ImageRenderer({ url, filename }: RendererProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/20 p-4">
      <img
        src={url}
        alt={filename}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}
