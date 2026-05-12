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
