export type Message = {
  id: number;
  text?: string;
  image?: string;
  sender: 'user' | 'character';
  time: string;
  date: string;
};
