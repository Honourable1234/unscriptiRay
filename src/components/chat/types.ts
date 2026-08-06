export type Message = {
  id: number;
  messageId?: string;
  text?: string;
  image?: string;
  sender: 'user' | 'character';
  time: string;
  date: string;
};
