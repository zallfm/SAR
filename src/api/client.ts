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

// ✅ tambahkan properti params di sini
type HttpOptions = {
  path: string; // contoh: '/auth/login'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: any;
  params?: Record<string, any>; // <-- query string (baru)
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

// ✅ helper untuk serialize query params jadi ?key=value
function buildQuery(params?: Record<string, any>): string {
  if (!params) return '';
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return; // skip kosong
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)));
    } else if (value instanceof Date) {
      query.append(key, value.toISOString());
    } else {
      query.append(key, String(value));
    }
  });

  const q = query.toString();
  return q ? `?${q}` : '';
}

export async function http<T>(opts: HttpOptions): Promise<T> {
  // ✅ tambahkan dukungan untuk params/query
  const url = buildUrl(opts.path) + buildQuery(opts.params);

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
