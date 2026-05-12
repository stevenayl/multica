"use client";

import type { RendererProps } from "../types";

export function PdfRenderer({ url, filename }: RendererProps) {
  return (
    <iframe
      src={url}
      title={filename}
      className="h-full w-full border-0"
    />
  );
}
