import { useState } from 'react';

export function useConfigManager<T>(defaultConfig: T) {
  const [config, setConfig] = useState<T>(defaultConfig);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return { config, updateConfig, resetConfig };
}