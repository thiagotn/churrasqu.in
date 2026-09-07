export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const BASE = API_BASE;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : (data?.message ?? 'Deu ruim na conexão — tenta de novo?');
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export interface Session {
  token: string;
  name: string;
}

const KEY = 'churrasquin.session';

export const session = {
  get(): Session | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },
  set(value: Session): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* storage indisponível: sessão só em memória */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  },
};
