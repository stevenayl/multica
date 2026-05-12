"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useT } from "../../i18n";
import type { RendererProps } from "../types";

export function CsvRenderer({ url }: RendererProps) {
  const { t } = useT("editor");
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) =>
        res.ok ? res.text() : Promise.reject(new Error(String(res.status))),
      )
      .then((text) => Papa.parse<string[]>(text, { skipEmptyLines: true }))
      .then((result) => {
        if (!cancelled) setRows(result.data);
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
  if (!rows) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t(($) => $.file_preview.loading)}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i === 0 ? "bg-muted font-medium" : "hover:bg-muted/40"}
            >
              {row.map((cell, j) => (
                <td key={j} className="border border-border px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
