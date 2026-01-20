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

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ElementType;
  disabled?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 组合作品项数据
export interface ComboItemData {
  toolKey: string;
  toolName: string;
  title: string;
  config: any;
  duration: number;
}

// 保存的组合数据
export interface ComboData {
  id: string;
  name: string;
  items: ComboItemData[];
  createdAt: number;
  totalDuration: number;
}

