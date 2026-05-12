"use client";

import { lazy, Suspense, useMemo } from "react";
import { useT } from "../i18n";
import { getPreviewSizeCap, getRendererKey } from "./get-renderer";
import { ImageRenderer } from "./renderers/image-renderer";
import { MediaRenderer } from "./renderers/media-renderer";
import { TextRenderer } from "./renderers/text-renderer";
import { PdfRenderer } from "./renderers/pdf-renderer";
import { HtmlRenderer } from "./renderers/html-renderer";
import { MarkdownRenderer } from "./renderers/markdown-renderer";
import { UnsupportedRenderer } from "./renderers/unsupported-renderer";
import { useResolvedPreviewUrl } from "./use-resolved-preview-url";
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

interface FilePreviewProps extends RendererProps {
  /** Optional file size in bytes. When provided and over the per-kind cap,
   *  the renderer falls back to a "too large" download prompt to avoid
   *  blocking the main thread parsing huge files. */
  sizeBytes?: number;
  /** Optional attachment id. When supplied, the preview re-signs the URL
   *  via `api.getAttachment(id).download_url` so renderers don't fetch a
   *  stale signed link. Required for surfaces outside
   *  `AttachmentDownloadProvider` (e.g. comment AttachmentList). */
  attachmentId?: string;
}

export function FilePreview({
  url,
  filename,
  sizeBytes,
  attachmentId,
}: FilePreviewProps) {
  const { t } = useT("editor");
  const key = useMemo(() => getRendererKey(filename), [filename]);
  const resolved = useResolvedPreviewUrl(url, attachmentId);

  const fallback = (
    <div className="p-4 text-sm text-muted-foreground">
      {t(($) => $.file_preview.loading)}
    </div>
  );

  // Size cap — only applies to kinds that load the whole file into memory.
  // Browser-streamed kinds (image / video / audio / pdf iframe) skip this.
  const cap = getPreviewSizeCap(key);
  if (cap !== undefined && sizeBytes !== undefined && sizeBytes > cap) {
    return <UnsupportedRenderer url={url} filename={filename} reason="too_large" />;
  }

  if (resolved.kind === "loading") return fallback;
  if (resolved.kind === "error") {
    return (
      <div className="p-4 text-sm text-destructive">
        {t(($) => $.file_preview.load_failed)}
      </div>
    );
  }

  const signedUrl = resolved.url;

  switch (key) {
    case "image":
      return <ImageRenderer url={signedUrl} filename={filename} />;
    case "video":
    case "audio":
      return <MediaRenderer url={signedUrl} filename={filename} />;
    case "text":
      return <TextRenderer url={signedUrl} filename={filename} />;
    case "pdf":
      return <PdfRenderer url={signedUrl} filename={filename} />;
    case "html":
      return <HtmlRenderer url={signedUrl} filename={filename} />;
    case "markdown":
      return <MarkdownRenderer url={signedUrl} filename={filename} />;
    case "csv":
      return (
        <Suspense fallback={fallback}>
          <CsvRenderer url={signedUrl} filename={filename} />
        </Suspense>
      );
    case "xlsx":
      return (
        <Suspense fallback={fallback}>
          <XlsxRenderer url={signedUrl} filename={filename} />
        </Suspense>
      );
    case "docx":
      return (
        <Suspense fallback={fallback}>
          <DocxRenderer url={signedUrl} filename={filename} />
        </Suspense>
      );
    case "unsupported":
    default:
      return <UnsupportedRenderer url={signedUrl} filename={filename} />;
  }
}
