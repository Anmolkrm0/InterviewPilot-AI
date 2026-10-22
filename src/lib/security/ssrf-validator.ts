import dns from "dns/promises";
import net from "net";

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Checks if an IPv4 address belongs to a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid format treated as unsafe
  }

  const [p0, p1] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;

  // 10.0.0.0/8 (Private)
  if (p0 === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;

  // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;

  // 172.16.0.0/12 (Private)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (p0 === 192 && p1 === 0 && parts[2] === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (p0 === 192 && p1 === 0 && parts[2] === 2) return true;

  // 192.168.0.0/16 (Private)
  if (p0 === 192 && p1 === 168) return true;

  // 198.18.0.0/15 (Network benchmark tests)
  if (p0 === 198 && (p1 === 18 || p1 === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (p0 === 198 && p1 === 51 && parts[2] === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (p0 === 203 && p1 === 0 && parts[2] === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (p0 >= 224 && p0 <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (p0 >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is private, loopback, or reserved.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 loopback
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // :: unspecified
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // Unique Local (fc00::/7 -> fc.. or fd..)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-Local (fe80::/10 -> fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(normalized)) return true;

  // IPv4-mapped IPv6 (::ffff:192.168.1.1)
  if (normalized.includes("::ffff:")) {
    const ipv4Part = normalized.split("::ffff:")[1];
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  return false;
}

/**
 * Validates a target URL against SSRF threats.
 * Throws SecurityError if target is prohibited.
 */
export async function validateSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SecurityError("Invalid URL format.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SecurityError(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "metadata.google.internal"
  ) {
    throw new SecurityError("Access to internal/private hosts is forbidden.");
  }

  // Check if hostname is directly an IP
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      throw new SecurityError(`Access to private IP ${hostname} is blocked.`);
    }
    return parsed;
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      throw new SecurityError(`Access to private IPv6 ${hostname} is blocked.`);
    }
    return parsed;
  }

  // Resolve hostname via DNS to prevent DNS rebinding to private IPs
  try {
    const lookupResults = await dns.lookup(hostname, { all: true });
    if (!lookupResults || lookupResults.length === 0) {
      throw new SecurityError(`Could not resolve hostname ${hostname}.`);
    }

    for (const record of lookupResults) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new SecurityError(`Resolved host points to forbidden private IP (${record.address}).`);
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new SecurityError(`Resolved host points to forbidden IPv6 address (${record.address}).`);
      }
    }
  } catch (err: unknown) {
    if (err instanceof SecurityError) throw err;
    throw new SecurityError(`DNS lookup failed for hostname ${hostname}.`);
  }

  return parsed;
}
