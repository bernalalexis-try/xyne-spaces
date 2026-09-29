import { beforeEach, describe, expect, it, vi } from "vitest";

// Mirrors the real storage services, which reject an empty buffer.
const uploadFileV2 = vi.fn(async (buffer: Buffer, _options: { path: string }) => {
  if (buffer.length === 0) throw new Error("File buffer is empty or invalid");
  return {};
});

vi.mock("@xyne/storage", () => ({
  createStorageService: () => ({ uploadFileV2 }),
  isPreconditionFailed: () => false,
  setStorageLogger: () => {},
}));

const { gcsPutDebugIndex } = await import("../src/storage.js");

beforeEach(() => {
  uploadFileV2.mockClear();
});

describe("gcsPutDebugIndex", () => {
  it("writes the discovery marker with a non-empty body", async () => {
    const written = await gcsPutDebugIndex("_index/conv-1/run-1~store-1.json");

    expect(written).toBe(true);
    expect(uploadFileV2).toHaveBeenCalledTimes(1);
    const [buffer, options] = uploadFileV2.mock.calls[0]!;
    expect(buffer.length).toBeGreaterThan(0);
    expect(JSON.parse(buffer.toString())).toEqual({});
    expect(options.path).toBe("claw-debug-runs/_index/conv-1/run-1~store-1.json");
  });
});
