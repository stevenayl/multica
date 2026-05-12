"use client";

import { Download, FileQuestion, FileWarning } from "lucide-react";
import { Button } from "@multica/ui/components/ui/button";
import { useT } from "../../i18n";
import { useAttachmentDownloadResolver } from "../../editor/attachment-download-context";
import type { RendererProps } from "../types";

export type UnsupportedReason = "unsupported" | "too_large";

export function UnsupportedRenderer({
  url,
  filename,
  reason = "unsupported",
}: RendererProps & { reason?: UnsupportedReason }) {
  const { t } = useT("editor");
  const { openByUrl } = useAttachmentDownloadResolver();

  const Icon = reason === "too_large" ? FileWarning : FileQuestion;
  const message =
    reason === "too_large"
      ? t(($) => $.file_preview.too_large, { filename })
      : t(($) => $.file_preview.unsupported, { filename });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <Icon className="size-12 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">{message}</div>
      <Button variant="outline" size="sm" onClick={() => openByUrl(url)}>
        <Download className="mr-1 size-4" />
        {t(($) => $.file_preview.download)}
      </Button>
    </div>
  );
}
