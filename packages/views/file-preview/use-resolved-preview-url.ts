"use client";

import { useEffect, useState } from "react";
import { api } from "@multica/core/api";
import { useAttachmentDownloadResolver } from "../editor/attachment-download-context";

export type ResolvedUrlState =
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "error" };

/**
 * Resolves a markdown / file-card URL to a fresh signed `download_url` so
 * preview renderers don't fetch a stale CDN link. Resolution order:
 *
 * 1. Explicit `attachmentId` prop (preferred — works in surfaces that
 *    don't mount `AttachmentDownloadProvider`, e.g. `AttachmentList`).
 * 2. Context resolver (`AttachmentDownloadProvider` mapping URL → id).
 * 3. Raw URL passthrough (external link in markdown — relies on CORS).
 *
 * Why this exists: `useDownloadAttachment` re-signs at click time so file
 * downloads don't 403 on stale URLs. Preview has the same expiry problem.
 */
export function useResolvedPreviewUrl(
  rawUrl: string,
  attachmentId?: string,
): ResolvedUrlState {
  const { resolveAttachmentId } = useAttachmentDownloadResolver();
  // Lazy initial state: when nothing needs to be re-signed, return ready
  // synchronously on first render so tests / users don't see a flash of
  // loading state. Only enter "loading" when we'll actually call the API.
  const initialId = attachmentId ?? resolveAttachmentId(rawUrl);
  const [state, setState] = useState<ResolvedUrlState>(() => {
    if (!rawUrl && !initialId) return { kind: "error" };
    if (!initialId) return { kind: "ready", url: rawUrl };
    return { kind: "loading" };
  });

  useEffect(() => {
    let cancelled = false;
    if (!rawUrl && !attachmentId) {
      setState({ kind: "error" });
      return;
    }

    const id = attachmentId ?? resolveAttachmentId(rawUrl);
    if (!id) {
      setState({ kind: "ready", url: rawUrl });
      return;
    }

    setState({ kind: "loading" });
    api
      .getAttachment(id)
      .then((att) => {
        if (cancelled) return;
        if (att.download_url) {
          setState({ kind: "ready", url: att.download_url });
        } else {
          setState({ kind: "error" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [rawUrl, attachmentId, resolveAttachmentId]);

  return state;
}
