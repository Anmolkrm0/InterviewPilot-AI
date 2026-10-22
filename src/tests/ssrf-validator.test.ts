import { describe, it, expect } from "vitest";
import { isPrivateIPv4, isPrivateIPv6, validateSafeUrl, SecurityError } from "../lib/security/ssrf-validator";

describe("SSRF Validator", () => {
  it("correctly identifies private and reserved IPv4 addresses", () => {
    expect(isPrivateIPv4("127.0.0.1")).toBe(true);
    expect(isPrivateIPv4("10.0.0.1")).toBe(true);
    expect(isPrivateIPv4("192.168.1.100")).toBe(true);
    expect(isPrivateIPv4("172.16.0.1")).toBe(true);
    expect(isPrivateIPv4("172.31.255.255")).toBe(true);
    expect(isPrivateIPv4("169.254.169.254")).toBe(true);
    expect(isPrivateIPv4("0.0.0.0")).toBe(true);
    expect(isPrivateIPv4("224.0.0.1")).toBe(true);

    // Public IPs should return false
    expect(isPrivateIPv4("8.8.8.8")).toBe(false);
    expect(isPrivateIPv4("93.184.216.34")).toBe(false);
  });

  it("correctly identifies private IPv6 addresses", () => {
    expect(isPrivateIPv6("::1")).toBe(true);
    expect(isPrivateIPv6("fe80::1")).toBe(true);
    expect(isPrivateIPv6("fc00::1")).toBe(true);
    expect(isPrivateIPv6("fd12:3456:789a::1")).toBe(true);
  });

  it("rejects non-HTTP protocols", async () => {
    await expect(validateSafeUrl("ftp://example.com/file")).rejects.toThrow(SecurityError);
    await expect(validateSafeUrl("file:///etc/passwd")).rejects.toThrow(SecurityError);
    await expect(validateSafeUrl("javascript:alert(1)")).rejects.toThrow(SecurityError);
  });

  it("rejects localhost and metadata endpoints", async () => {
    await expect(validateSafeUrl("http://localhost:3000")).rejects.toThrow(SecurityError);
    await expect(validateSafeUrl("http://127.0.0.1:8080")).rejects.toThrow(SecurityError);
    await expect(validateSafeUrl("http://169.254.169.254/latest/meta-data/")).rejects.toThrow(SecurityError);
    await expect(validateSafeUrl("http://metadata.google.internal")).rejects.toThrow(SecurityError);
  });
});
