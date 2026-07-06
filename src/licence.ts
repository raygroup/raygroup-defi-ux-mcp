/**
 * Pro-tier licence validation.
 *
 * Design constraints:
 * - The free tier MUST keep working with zero network access. If RAYGROUP_API_KEY
 *   is unset, this module never reaches out to the network.
 * - Validation happens at most once per 24h per machine (disk-cached).
 * - Any network or validation failure silently degrades to the free tier — we
 *   never throw, never block the MCP server start.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CACHE_DIR = path.join(os.homedir(), ".raygroup-mcp");
const CACHE_FILE = path.join(CACHE_DIR, "licence.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const DEFAULT_API_BASE = "https://raygroup-api.raygroup-uk.workers.dev";

export type LicenceStatus = {
  valid: boolean;
  plan: "free" | "pro";
  apiBase: string;
  apiKey: string | null;
  reason?: string;
};

type CachedLicence = {
  key: string;
  valid: boolean;
  plan: "free" | "pro";
  cachedAt: number;
};

function readCache(): CachedLicence | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const cached = JSON.parse(raw) as CachedLicence;
    if (
      typeof cached?.key !== "string" ||
      typeof cached?.valid !== "boolean" ||
      typeof cached?.cachedAt !== "number"
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function writeCache(entry: CachedLicence): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(entry), "utf8");
  } catch {
    // Cache writes are best-effort; never block validation on disk errors.
  }
}

async function callValidateEndpoint(
  apiBase: string,
  key: string,
): Promise<{ valid: boolean; plan: "free" | "pro" }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `${apiBase}/licence/validate?key=${encodeURIComponent(key)}`,
      {
        method: "GET",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      },
    );
    if (res.status === 200) {
      const data = (await res.json()) as { plan?: string };
      const plan = data?.plan === "pro" ? "pro" : "free";
      return { valid: plan === "pro", plan };
    }
    return { valid: false, plan: "free" };
  } catch {
    return { valid: false, plan: "free" };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolve the current Pro-tier licence status.
 *
 * Safe to call on every startup — the result is cached for 24h per (key, machine).
 */
export async function resolveLicence(): Promise<LicenceStatus> {
  const apiKey = (process.env.RAYGROUP_API_KEY ?? "").trim();
  const apiBase = (process.env.RAYGROUP_API_BASE ?? DEFAULT_API_BASE).replace(
    /\/$/,
    "",
  );

  if (!apiKey) {
    return {
      valid: false,
      plan: "free",
      apiBase,
      apiKey: null,
      reason: "no_key",
    };
  }

  const cached = readCache();
  const now = Date.now();
  if (cached && cached.key === apiKey && now - cached.cachedAt < CACHE_TTL_MS) {
    return {
      valid: cached.valid,
      plan: cached.plan,
      apiBase,
      apiKey,
      reason: "cache",
    };
  }

  const { valid, plan } = await callValidateEndpoint(apiBase, apiKey);
  writeCache({ key: apiKey, valid, plan, cachedAt: now });
  return {
    valid,
    plan,
    apiBase,
    apiKey,
    reason: valid ? "validated" : "rejected",
  };
}
