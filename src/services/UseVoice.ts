import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export const useVoices = () => {
  const { token } = useAuth();
  const getVoices = () => {
    return api.get('/voice/list', token ?? undefined);
  };
  return { getVoices };
};
