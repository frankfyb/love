import { ToolTemplate } from '@/types';

export const getWorks = (toolKey: string): ToolTemplate[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`toolTemplates:${toolKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Failed to load works for ${toolKey}`, e);
    return [];
  }
};

export const saveWorks = (toolKey: string, works: ToolTemplate[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`toolTemplates:${toolKey}`, JSON.stringify(works));
  } catch (e) {
    console.error(`Failed to save works for ${toolKey}`, e);
  }
};
