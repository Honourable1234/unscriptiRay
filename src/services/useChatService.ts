import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';

export type WebSettings = {
  allow_character_messages: boolean;
  background_display: boolean;
  language: string;
  lust_level: string;
  response_length: string;
};

export const useChatService = () => {
  const { token } = useAuth();

  const startChat = (characterId: string) =>
    api.post('/chat/start', { character_id: characterId }, token ?? undefined);

  const getChatList = (page = 1) =>
    api.get(`/chat/list?page=${page}`, token ?? undefined);

  const getMessages = (chatroomId: string, cursor?: string) =>
    api.get(`/chat/${chatroomId}/messages${cursor ? `?cursor=${cursor}` : ''}`, token ?? undefined);

  const getSuggestions = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/suggestions`, {}, token);
  };

  const rateChat = (chatroomId: string, rating: number) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/rate`, { rating }, token);
  };

  const getMemory = (chatroomId: string) =>
    api.get(`/chat/${chatroomId}/memory`, token ?? undefined);

  const addMemory = (chatroomId: string, summary: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/memory`, { summary }, token);
  };

  const clearMessages = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/chat/${chatroomId}/messages`, token);
  };

  const getSettings = (chatroomId: string) =>
    api.get(`/chat/${chatroomId}/settings`, token ?? undefined);

  const updateSettings = (chatroomId: string, settings: WebSettings) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.patch(`/chat/${chatroomId}/settings`, { web_settings: settings as unknown as Record<string, unknown> }, token);
  };

  return {
    startChat,
    getChatList,
    getMessages,
    getSuggestions,
    rateChat,
    getMemory,
    addMemory,
    clearMessages,
    getSettings,
    updateSettings,
  };
};
