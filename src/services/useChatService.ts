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

  const sendMessage = (chatroomId: string, body: { content?: string; image?: string }) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/messages`, body, token);
  };

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

  const addMemory = (chatroomId: string, message: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/memory`, { message }, token);
  };

  const clearMessages = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/chat/${chatroomId}/messages`, token);
  };

  const deleteRoom = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.delete(`/chat/${chatroomId}`, token);
  };

  const getInstructions = (chatroomId: string) =>
    api.get(`/chat/${chatroomId}/instructions`, token ?? undefined);

  const addInstruction = (chatroomId: string, message: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.put(`/chat/${chatroomId}/instructions`, { message }, token);
  };

  const initiateCall = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/voice/call', { chatroom_id: chatroomId }, token);
  };

  const textToSpeech = (content: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/voice/tts', { content }, token);
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
    sendMessage,
    getSuggestions,
    rateChat,
    getMemory,
    addMemory,
    clearMessages,
    deleteRoom,
    initiateCall,
    textToSpeech,
    getInstructions,
    addInstruction,
    getSettings,
    updateSettings,
  };
};
