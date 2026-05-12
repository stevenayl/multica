"use client";

import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { Button } from "@multica/ui/components/ui/button";
import { useT } from "../i18n";
import { useAttachmentDownloadResolver } from "../editor/attachment-download-context";
import { FilePreview } from "./file-preview";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  filename: string;
}

export function FilePreviewModal({ open, onOpenChange, url, filename }: Props) {
  const { t } = useT("editor");
  const { openByUrl } = useAttachmentDownloadResolver();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] w-[90vw] max-w-[1100px] flex-col gap-0 p-0 sm:max-w-[1100px]">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-2 border-b px-4 py-2">
          <DialogTitle className="truncate text-sm font-medium">
            {filename}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="mr-8"
            onClick={() => openByUrl(url)}
          >
            <Download className="mr-1 size-4" />
            {t(($) => $.file_preview.download)}
          </Button>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <FilePreview url={url} filename={filename} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
