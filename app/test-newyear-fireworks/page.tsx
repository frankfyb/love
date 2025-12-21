'use client';

import React from 'react';
import { DisplayUI } from '@/tools/newyear-fireworks';
import { DEFAULT_CONFIG } from '@/tools/newyear-fireworks/index';

export default function TestNewYearFireworks() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}