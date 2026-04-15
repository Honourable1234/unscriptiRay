export type Character = {
  id: string | number;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  likes: string;
  comments: string;
  tags: string[];
};
