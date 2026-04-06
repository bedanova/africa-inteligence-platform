export interface ApiMeta {
  generated_at: string;
  freshness: "fresh" | "aging" | "stale";
  sources: number;
  cache_status: "HIT" | "MISS" | "BYPASS";
  trace_id?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

function resolveUrl(path: string): string {
  // On the server, fetch requires an absolute URL
  if (typeof window === 'undefined') {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    return `${base}${path}`
  }
  // On the client, relative paths work fine
  return path
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const url = resolveUrl(path)
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<ApiResponse<T>>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
