"use client";

import { Download, FileQuestion } from "lucide-react";
import { Button } from "@multica/ui/components/ui/button";
import { useT } from "../../i18n";
import { useAttachmentDownloadResolver } from "../../editor/attachment-download-context";
import type { RendererProps } from "../types";

export function UnsupportedRenderer({ url, filename }: RendererProps) {
  const { t } = useT("editor");
  const { openByUrl } = useAttachmentDownloadResolver();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
      <FileQuestion className="size-12 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        {t(($) => $.file_preview.unsupported, { filename })}
      </div>
      <Button variant="outline" size="sm" onClick={() => openByUrl(url)}>
        <Download className="mr-1 size-4" />
        {t(($) => $.file_preview.download)}
      </Button>
    </div>
  );
}
