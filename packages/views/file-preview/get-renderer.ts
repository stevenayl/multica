export type RendererKey =
  | "html"
  | "markdown"
  | "text"
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "csv"
  | "xlsx"
  | "docx"
  | "unsupported";

const EXT_MAP: Record<string, RendererKey> = {
  html: "html",
  htm: "html",
  md: "markdown",
  mdx: "markdown",
  markdown: "markdown",
  txt: "text",
  log: "text",
  json: "text",
  yaml: "text",
  yml: "text",
  ts: "text",
  tsx: "text",
  js: "text",
  jsx: "text",
  py: "text",
  go: "text",
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  csv: "csv",
  xlsx: "xlsx",
  xls: "xlsx",
  docx: "docx",
};

export function getRendererKey(filename: string): RendererKey {
  if (!filename) return "unsupported";
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "unsupported";
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXT_MAP[ext] ?? "unsupported";
}

// Per-kind preview size cap. Anything above this falls back to a download
// prompt so we don't lock up the main thread parsing a 50 MB log or 100 MB
// xlsx in-browser. Renderers that stream via the browser (image / video /
// audio / pdf via iframe) are not capped here — the browser handles them.
const SIZE_CAPS: Partial<Record<RendererKey, number>> = {
  text: 5 * 1024 * 1024,
  html: 5 * 1024 * 1024,
  markdown: 5 * 1024 * 1024,
  csv: 20 * 1024 * 1024,
  xlsx: 20 * 1024 * 1024,
  docx: 20 * 1024 * 1024,
};

export function getPreviewSizeCap(kind: RendererKey): number | undefined {
  return SIZE_CAPS[kind];
}
