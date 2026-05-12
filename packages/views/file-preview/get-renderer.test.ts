import { describe, it, expect } from "vitest";
import { getRendererKey } from "./get-renderer";

describe("getRendererKey", () => {
  it.each([
    ["foo.html", "html"],
    ["a/b/c.HTM", "html"],
    ["readme.md", "markdown"],
    ["readme.MDX", "markdown"],
    ["plan.txt", "text"],
    ["main.ts", "text"],
    ["file.pdf", "pdf"],
    ["pic.png", "image"],
    ["pic.JPG", "image"],
    ["movie.mp4", "video"],
    ["sound.mp3", "audio"],
    ["data.csv", "csv"],
    ["sheet.xlsx", "xlsx"],
    ["legacy.xls", "xlsx"],
    ["doc.docx", "docx"],
    ["weird.bin", "unsupported"],
    ["", "unsupported"],
    ["NOEXT", "unsupported"],
  ])("maps %s → %s", (filename, expected) => {
    expect(getRendererKey(filename)).toBe(expected);
  });
});
