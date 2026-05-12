import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithI18n } from "../test/i18n";
import { FilePreview } from "./file-preview";

beforeEach(() => {
  // jsdom doesn't ship a real `fetch`. Stub it for the renderers that
  // pull file content over HTTP.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response("hello"))),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FilePreview routing", () => {
  it("renders unsupported placeholder for unknown extension", () => {
    renderWithI18n(
      <FilePreview url="http://example.test/y.bin" filename="y.bin" />,
    );
    expect(screen.getByText(/no preview available/i)).toBeInTheDocument();
  });

  it("renders <img> for image files", () => {
    renderWithI18n(
      <FilePreview url="http://example.test/y.png" filename="y.png" />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "http://example.test/y.png",
    );
  });

  it("renders <iframe> for pdf files", () => {
    const { container } = renderWithI18n(
      <FilePreview url="http://example.test/y.pdf" filename="y.pdf" />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute("src", "http://example.test/y.pdf");
  });
});
