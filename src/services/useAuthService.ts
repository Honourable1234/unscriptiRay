import { api } from '@/libs/api';

export const useAuthService = () => {
  const register = (id: string, email: string | undefined, token: string) =>
    api.post('/auth/register', { id, email, password: '' }, token);

  return { register };
};
