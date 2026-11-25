/**
 * Thin HTTP client for the Pro-tier corpus endpoints on api.raygroup.uk.
 *
 * Responses are cached in memory for the lifetime of the MCP server process,
 * and on disk for 24h (in ~/.raygroup-mcp/corpus-cache.json) so a Pro user can
 * keep working offline once they've used a tool at least once.
 *
 * Any error returns null and the calling tool falls back to the bundled free
 * corpus.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { Pattern } from "./data/patterns.js";
import type { GlossaryEntry } from "./data/glossary.js";
import type { Persona } from "./data/personas-free.js";

const CACHE_DIR = path.join(os.homedir(), ".raygroup-mcp");
const CACHE_FILE = path.join(CACHE_DIR, "corpus-cache.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type CaseStudy = {
  slug: string;
  protocol: string;
  category: string;
  summary: string;
  whatHappened: string;
  applicableRubricAreas: string[];
  applicablePatternSlugs: string[];
  applicableGlossarySlugs: string[];
  designRemediation: string;
  references: { label: string; url: string }[];
};

export type VisualReference = {
  slug: string;
  title: string;
  protocol: string;
  surface: string;
  summary: string;
  whatToLookFor: string[];
  goodSignals: string[];
  antiPatterns: string[];
  rubricAreas: string[];
  patternSlugs: string[];
  glossarySlugs: string[];
  references: { label: string; url: string }[];
};

export type FlowStep = {
  id: string;
  label: string;
  kind: string;
  description: string;
  rubricAreas?: string[];
  patternSlugs?: string[];
};

export type FlowEdge = {
  from: string;
  to: string;
  when: string;
  path: "happy" | "unhappy" | "edge";
};

export type FlowGraph = {
  slug: string;
  title: string;
  kit: string;
  summary: string;
  personas: string[];
  steps: FlowStep[];
  edges: FlowEdge[];
  edgeCaseNotes: string[];
};

type CorpusBundle = {
  patterns?: Pattern[];
  glossary?: GlossaryEntry[];
  caseStudies?: CaseStudy[];
  personas?: Persona[];
  references?: VisualReference[];
  flows?: FlowGraph[];
};

type DiskCache = Record<
  string,
  { fetchedAt: number; data: CorpusBundle }
>;

type CorpusEndpoint =
  | "patterns"
  | "glossary"
  | "case-studies"
  | "personas"
  | "references"
  | "flows";

const memoryCache = new Map<string, CorpusBundle>();

function readDiskCache(): DiskCache {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) as DiskCache;
  } catch {
    return {};
  }
}

function writeDiskCache(cache: DiskCache): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf8");
  } catch {
    /* best-effort */
  }
}

async function fetchEndpoint<T extends CorpusBundle>(
  apiBase: string,
  apiKey: string,
  endpoint: CorpusEndpoint,
): Promise<T | null> {
  const cacheKey = `${endpoint}@${apiKey.slice(-8)}`;

  const mem = memoryCache.get(cacheKey);
  if (mem) return mem as T;

  const disk = readDiskCache();
  const diskEntry = disk[cacheKey];
  if (diskEntry && Date.now() - diskEntry.fetchedAt < CACHE_TTL_MS) {
    memoryCache.set(cacheKey, diskEntry.data);
    return diskEntry.data as T;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${apiBase}/corpus/${endpoint}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });
    if (res.status !== 200) {
      return null;
    }
    const data = (await res.json()) as T;
    memoryCache.set(cacheKey, data);
    disk[cacheKey] = { fetchedAt: Date.now(), data };
    writeDiskCache(disk);
    return data;
  } catch {
    if (diskEntry) {
      memoryCache.set(cacheKey, diskEntry.data);
      return diskEntry.data as T;
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchProPatterns(
  apiBase: string,
  apiKey: string,
): Promise<Pattern[]> {
  const data = await fetchEndpoint<{ patterns?: Pattern[] }>(
    apiBase,
    apiKey,
    "patterns",
  );
  return data?.patterns ?? [];
}

export async function fetchProGlossary(
  apiBase: string,
  apiKey: string,
): Promise<GlossaryEntry[]> {
  const data = await fetchEndpoint<{ glossary?: GlossaryEntry[] }>(
    apiBase,
    apiKey,
    "glossary",
  );
  return data?.glossary ?? [];
}

export async function fetchProCaseStudies(
  apiBase: string,
  apiKey: string,
): Promise<CaseStudy[]> {
  const data = await fetchEndpoint<{ caseStudies?: CaseStudy[] }>(
    apiBase,
    apiKey,
    "case-studies",
  );
  return data?.caseStudies ?? [];
}

export async function fetchProPersonas(
  apiBase: string,
  apiKey: string,
): Promise<Persona[]> {
  const data = await fetchEndpoint<{ personas?: Persona[] }>(
    apiBase,
    apiKey,
    "personas",
  );
  return data?.personas ?? [];
}

export async function fetchProReferences(
  apiBase: string,
  apiKey: string,
): Promise<VisualReference[]> {
  const data = await fetchEndpoint<{ references?: VisualReference[] }>(
    apiBase,
    apiKey,
    "references",
  );
  return data?.references ?? [];
}

export async function fetchProFlows(
  apiBase: string,
  apiKey: string,
): Promise<FlowGraph[]> {
  const data = await fetchEndpoint<{ flows?: FlowGraph[] }>(
    apiBase,
    apiKey,
    "flows",
  );
  return data?.flows ?? [];
}
