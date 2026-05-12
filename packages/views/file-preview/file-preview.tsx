"use client";

import { lazy, Suspense, useMemo } from "react";
import { useT } from "../i18n";
import { getRendererKey } from "./get-renderer";
import { ImageRenderer } from "./renderers/image-renderer";
import { MediaRenderer } from "./renderers/media-renderer";
import { TextRenderer } from "./renderers/text-renderer";
import { PdfRenderer } from "./renderers/pdf-renderer";
import { HtmlRenderer } from "./renderers/html-renderer";
import { MarkdownRenderer } from "./renderers/markdown-renderer";
import { UnsupportedRenderer } from "./renderers/unsupported-renderer";
import type { RendererProps } from "./types";

// Heavy renderers are split-loaded so a workspace that never previews a
// CSV/XLSX/DOCX never pays for SheetJS / docx-preview at boot.
const CsvRenderer = lazy(() =>
  import("./renderers/csv-renderer").then((m) => ({ default: m.CsvRenderer })),
);
const XlsxRenderer = lazy(() =>
  import("./renderers/xlsx-renderer").then((m) => ({ default: m.XlsxRenderer })),
);
const DocxRenderer = lazy(() =>
  import("./renderers/docx-renderer").then((m) => ({ default: m.DocxRenderer })),
);

export function FilePreview({ url, filename }: RendererProps) {
  const { t } = useT("editor");
  const key = useMemo(() => getRendererKey(filename), [filename]);

  const fallback = (
    <div className="p-4 text-sm text-muted-foreground">
      {t(($) => $.file_preview.loading)}
    </div>
  );

  switch (key) {
    case "image":
      return <ImageRenderer url={url} filename={filename} />;
    case "video":
    case "audio":
      return <MediaRenderer url={url} filename={filename} />;
    case "text":
      return <TextRenderer url={url} filename={filename} />;
    case "pdf":
      return <PdfRenderer url={url} filename={filename} />;
    case "html":
      return <HtmlRenderer url={url} filename={filename} />;
    case "markdown":
      return <MarkdownRenderer url={url} filename={filename} />;
    case "csv":
      return (
        <Suspense fallback={fallback}>
          <CsvRenderer url={url} filename={filename} />
        </Suspense>
      );
    case "xlsx":
      return (
        <Suspense fallback={fallback}>
          <XlsxRenderer url={url} filename={filename} />
        </Suspense>
      );
    case "docx":
      return (
        <Suspense fallback={fallback}>
          <DocxRenderer url={url} filename={filename} />
        </Suspense>
      );
    case "unsupported":
    default:
      return <UnsupportedRenderer url={url} filename={filename} />;
  }
}
