import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

/** Identity fields on the account that the owner can change. */
export type UpdateProfileBody = Partial<{
  display_name: string;
  username: string;
  image_url: string;
}>;

export const useUserService = () => {
  const { token } = useAuth();

  const updateProfile = (body: UpdateProfileBody) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.patch('/users/me', body, token) as Promise<{ success: boolean; message: string }>;
  };

  return { updateProfile };
};
