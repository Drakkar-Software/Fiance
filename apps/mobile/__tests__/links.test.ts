/**
 * Tests for lib/links.ts — URL parsing, serialization, and validation.
 */
import { describe, it, expect } from "vitest";
import { parseLinks, serializeLinks, isValidUrl } from "@/lib/links";

describe("parseLinks", () => {
  it("returns empty array for null", () => {
    expect(parseLinks(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(parseLinks(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseLinks("")).toEqual([]);
  });

  it("returns single URL as array", () => {
    expect(parseLinks("https://example.com")).toEqual(["https://example.com"]);
  });

  it("parses JSON array of URLs", () => {
    const json = JSON.stringify(["https://a.com", "https://b.com"]);
    expect(parseLinks(json)).toEqual(["https://a.com", "https://b.com"]);
  });

  it("returns raw string for non-array JSON", () => {
    expect(parseLinks('{"key": "value"}')).toEqual(['{"key": "value"}']);
  });

  it("returns raw string for invalid JSON", () => {
    expect(parseLinks("not json at all")).toEqual(["not json at all"]);
  });
});

describe("serializeLinks", () => {
  it("returns null for empty array", () => {
    expect(serializeLinks([])).toBeNull();
  });

  it("returns null for array of blank strings", () => {
    expect(serializeLinks(["  ", ""])).toBeNull();
  });

  it("returns single URL as plain string (not JSON)", () => {
    expect(serializeLinks(["https://example.com"])).toBe("https://example.com");
  });

  it("returns JSON array for multiple URLs", () => {
    const result = serializeLinks(["https://a.com", "https://b.com"]);
    expect(JSON.parse(result!)).toEqual(["https://a.com", "https://b.com"]);
  });

  it("trims whitespace from URLs", () => {
    expect(serializeLinks(["  https://a.com  "])).toBe("https://a.com");
  });

  it("filters out empty strings", () => {
    expect(serializeLinks(["https://a.com", "", "https://b.com"])).toBe(
      JSON.stringify(["https://a.com", "https://b.com"])
    );
  });
});

describe("isValidUrl", () => {
  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isValidUrl("HTTPS://Example.com")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(isValidUrl("  https://example.com  ")).toBe(true);
  });

  it("rejects URLs without protocol", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });

  it("rejects ftp URLs", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("rejects random text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});
