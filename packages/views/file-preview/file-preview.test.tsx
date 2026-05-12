import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithI18n } from "../test/i18n";

// Hoisted so the vi.mock factory below can reference it (vi.mock is
// hoisted to the top of the file, before normal `const` declarations).
const getAttachmentMock = vi.hoisted(() => vi.fn());

vi.mock("@multica/core/api", () => ({
  api: { getAttachment: getAttachmentMock },
}));

import { FilePreview } from "./file-preview";

beforeEach(() => {
  // jsdom doesn't ship a real `fetch`. Stub it for the renderers that
  // pull file content over HTTP.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response("hello"))),
  );
  getAttachmentMock.mockReset();
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

  it("falls back to too-large placeholder when sizeBytes exceeds cap", () => {
    renderWithI18n(
      <FilePreview
        url="http://example.test/big.xlsx"
        filename="big.xlsx"
        sizeBytes={50 * 1024 * 1024}
      />,
    );
    expect(screen.getByText(/too large/i)).toBeInTheDocument();
  });

  it("re-signs via api.getAttachment when attachmentId is provided", async () => {
    getAttachmentMock.mockResolvedValueOnce({
      id: "att-1",
      download_url: "http://signed.test/fresh.png?Signature=ABC",
    });
    const { container } = renderWithI18n(
      <FilePreview
        url="http://stale.test/old.png"
        filename="x.png"
        attachmentId="att-1"
      />,
    );

    await waitFor(() => {
      expect(getAttachmentMock).toHaveBeenCalledWith("att-1");
    });
    await waitFor(() => {
      const img = container.querySelector("img");
      expect(img?.getAttribute("src")).toBe(
        "http://signed.test/fresh.png?Signature=ABC",
      );
    });
  });
});
