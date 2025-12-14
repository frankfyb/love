import { useState, useEffect } from 'react';
import { ToolTemplate } from '@/types';
import { getWorks, saveWorks } from '@/services/storage';

export function useWorks(toolKey: string) {
  const [works, setWorks] = useState<ToolTemplate[]>([]);

  useEffect(() => {
    setWorks(getWorks(toolKey));
  }, [toolKey]);

  const addWork = (name: string, data: any) => {
    const newWork: ToolTemplate = { 
      id: String(Date.now()), 
      name, 
      data 
    };
    const newList = [newWork, ...works];
    setWorks(newList);
    saveWorks(toolKey, newList);
    return newWork;
  };

  const removeWork = (id: string) => {
    const newList = works.filter(w => w.id !== id);
    setWorks(newList);
    saveWorks(toolKey, newList);
  };

  const updateWork = (id: string, name: string) => {
    const newList = works.map(w => w.id === id ? { ...w, name } : w);
    setWorks(newList);
    saveWorks(toolKey, newList);
  }

  return { works, addWork, removeWork, updateWork };
}
