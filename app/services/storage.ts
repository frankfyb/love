import { ToolTemplate, ComboData } from '@/types';

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

// ====================== 组合存储 ======================
const COMBOS_STORAGE_KEY = 'user_combos';

export const getCombos = (): ComboData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMBOS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load combos', e);
    return [];
  }
};

export const saveCombo = (combo: ComboData): void => {
  if (typeof window === 'undefined') return;
  try {
    const combos = getCombos();
    const existingIndex = combos.findIndex(c => c.id === combo.id);
    if (existingIndex >= 0) {
      combos[existingIndex] = combo;
    } else {
      combos.unshift(combo);
    }
    localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos));
  } catch (e) {
    console.error('Failed to save combo', e);
  }
};

export const deleteCombo = (comboId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const combos = getCombos().filter(c => c.id !== comboId);
    localStorage.setItem(COMBOS_STORAGE_KEY, JSON.stringify(combos));
  } catch (e) {
    console.error('Failed to delete combo', e);
  }
};

export const getComboById = (comboId: string): ComboData | null => {
  const combos = getCombos();
  return combos.find(c => c.id === comboId) || null;
};
