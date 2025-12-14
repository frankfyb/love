export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  stats: {
    works: number;
    visits: string;
    collections: number;
  };
}

export interface UserWorkItem {
  id: string;
  title: string;
  toolKey: string;
  toolName: string;
  date: string;
  visits: number | string;
  config: any;
}

export interface ToolTemplate {
  id: string;
  name: string;
  data: any;
}

export type PageKey = 'home' | 'love' | 'profile';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}
