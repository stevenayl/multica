"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

interface Sheet {
  name: string;
  html: string;
}

export function XlsxRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const [sheets, setSheets] = useState<Sheet[] | null>(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) =>
        res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status))),
      )
      .then((buf) => {
        const wb = XLSX.read(buf, { type: "array" });
        const out: Sheet[] = wb.SheetNames.map((name) => {
          const sheet = wb.Sheets[name];
          if (!sheet) return { name, html: "" };
          return {
            name,
            html: XLSX.utils.sheet_to_html(sheet, { editable: false }),
          };
        });
        if (!cancelled) setSheets(out);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        {t(($) => $.file_preview.load_failed)}
      </div>
    );
  }
  if (!sheets) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t(($) => $.file_preview.loading)}
      </div>
    );
  }

  const current = sheets[active];

  return (
    <div className="flex h-full w-full flex-col">
      {sheets.length > 1 && (
        <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-2 py-1 text-xs">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? "shrink-0 rounded bg-primary px-2 py-1 text-primary-foreground"
                  : "shrink-0 rounded px-2 py-1 hover:bg-muted"
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div
        className="xlsx-preview flex-1 overflow-auto p-2 text-sm [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1"
        // sheet_to_html does NOT execute scripts (the library strips them);
        // output is library-controlled HTML, not raw user input.
        dangerouslySetInnerHTML={{ __html: current?.html ?? "" }}
      />
    </div>
  );
}
