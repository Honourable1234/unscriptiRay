import { Env } from './Env';

const inFlight = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  status: number;
  code?: string;
  signupRequired?: boolean;

  constructor(message: string, options: { status: number; code?: string; signupRequired?: boolean }) {
    super(message);
    this.status = options.status;
    this.code = options.code;
    this.signupRequired = options.signupRequired;
  }
}

type PaymentRequiredHandler = (error: ApiError) => void;

let onPaymentRequired: PaymentRequiredHandler | null = null;

/**
 * Registers the single listener notified whenever a request is refused for
 * lack of coins, so the buy-coins prompt is raised once rather than per screen.
 * @param handler - Called with the 402 error, or null to unsubscribe.
 */
export const setPaymentRequiredHandler = (handler: PaymentRequiredHandler | null) => {
  onPaymentRequired = handler;
};

const throwApiError = async (res: Response): Promise<never> => {
  const body = await res.json().catch(() => ({})) as { message?: string; detail?: string; error?: string; signup_required?: boolean };
  const error = new ApiError(body.message ?? body.detail ?? `HTTP ${res.status}`, {
    status: res.status,
    code: body.error,
    signupRequired: body.signup_required,
  });
  if (res.status === 402) {
    onPaymentRequired?.(error);
  }
  throw error;
};

export const api = {
  get: async (path: string, token?: string) => {
    const key = `${token ?? ''}|${path}`;
    const existing = inFlight.get(key);
    if (existing) {
      return existing;
    }

    const promise = fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).then(async (res) => {
      if (!res.ok) {
        await throwApiError(res);
      }
      return res.json();
    }).finally(() => inFlight.delete(key));

    inFlight.set(key, promise);
    return promise;
  },
  delete: async (path: string, token?: string, body?: Record<string, unknown>) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      await throwApiError(res);
    }
    return res.json();
  },
  patch: async (path: string, body: Record<string, unknown>, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      await throwApiError(res);
    }

    return res.json();
  },
  put: async (path: string, body: Record<string, unknown>, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      await throwApiError(res);
    }
    return res.json();
  },
  post: async (path: string, body: Record<string, unknown>, token?: string) => {
    const res = await fetch(`${Env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      await throwApiError(res);
    }

    return res.json();
  },
};
