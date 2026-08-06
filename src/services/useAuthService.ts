import { api } from '@/libs/api';

export const createAuthService = () => {
  const register = (params: { id: string; email: string | undefined; token: string; guestToken?: string }) =>
    api.post(
      '/auth/register',
      { id: params.id, email: params.email, password: '', ...(params.guestToken ? { guest_token: params.guestToken } : {}) },
      params.token,
    );

  const claimGuest = (guestToken: string, token: string) =>
    api.post('/auth/claim-guest', { guest_token: guestToken }, token);

  return { register, claimGuest };
};
