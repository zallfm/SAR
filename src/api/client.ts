export const API_BASE = 'http://localhost:3000/api';

const genReqId = () =>
  (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) + Date.now();

export type HttpError = {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
  details?: Record<string, any>;
};

type HttpOptions = {
  path: string; // contoh: '/auth/login'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: any;
  headers?: Record<string, string>;
};

// helper untuk gabung base + path, tapi tetap hormati URL absolut
function buildUrl(path: string) {
  try {
    // kalau path sudah absolut (http:// atau https://), langsung return
    return new URL(path).toString();
  } catch {
    const base = API_BASE.replace(/\/+$/, ''); // hapus slash akhir
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }
}

export async function http<T>(opts: HttpOptions): Promise<T> {
  const url = buildUrl(opts.path);

  // buat headers dinamis
  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
    'x-request-id': genReqId(),
    ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
  };

  // hanya tambahkan content-type kalau ada body
  if (opts.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = await res.json().catch(() => ({})); // fallback kalau bukan JSON

  if (!res.ok) {
    const err: HttpError = {
      status: res.status,
      code: json?.code,
      message: json?.message ?? 'Request failed',
      requestId: json?.requestId,
      details: json?.details,
    };
    throw err;
  }

  return json as T;
}
