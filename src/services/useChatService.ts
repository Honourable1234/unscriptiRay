import { useAuth } from '@/context/AuthContext';
import { api } from '@/libs/api';
import { guestToken } from '@/libs/guestToken';

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
    api.post('/chat/start', { character_id: characterId }, token ?? guestToken.get() ?? undefined);

  const getChatList = (page = 1) =>
    api.get(`/chat/list?page=${page}`, token ?? undefined);

  const getMessages = (chatroomId: string, cursor?: string) =>
    api.get(`/chat/${chatroomId}/messages${cursor ? `?cursor=${cursor}` : ''}`, token ?? guestToken.get() ?? undefined);

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

  const addMemory = (chatroomId: string, content: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/memory`, { content }, token);
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

  const updateInstructions = (chatroomId: string, customInstructions: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.put(`/chat/${chatroomId}/instructions`, { instructions: customInstructions }, token);
  };

  const initiateCall = (chatroomId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post('/voice/call', { chatroom_id: chatroomId }, token);
  };

  const getMessageSpeech = (chatroomId: string, messageId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.post(`/chat/${chatroomId}/messages/${encodeURIComponent(messageId)}/speech`, {}, token) as Promise<{
      success: boolean;
      content: { audio: string; format: string };
    }>;
  };

  const getSettings = (chatroomId: string) =>
    api.get(`/chat/${chatroomId}/settings`, token ?? undefined);

  const updateSettings = (chatroomId: string, settings: WebSettings) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.patch(`/chat/${chatroomId}/settings`, { web_settings: settings as unknown as Record<string, unknown> }, token);
  };

  const updateVoice = (chatroomId: string, voiceId: string) => {
    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return api.patch(`/chat/${chatroomId}/settings`, { voice_id: voiceId }, token);
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
    getMessageSpeech,
    getInstructions,
    updateInstructions,
    getSettings,
    updateSettings,
    updateVoice,
  };
};
