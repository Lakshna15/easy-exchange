import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/domain/navigation";

describe("Return address after login", () => {
  it.each([
    ["/plants/new", "/plants/new"],
    ["/swaps?tab=incoming", "/swaps?tab=incoming"],
    ["https://evil.example", "/"],
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
    ["javascript:alert(1)", "/"],
    ["", "/"],
    [undefined, "/"],
  ])("AC-AUTH-5: the return address %j leads to %j", (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
  });
});
