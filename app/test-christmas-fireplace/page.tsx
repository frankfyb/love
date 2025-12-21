'use client';

import React from 'react';
import { DisplayUI } from '@/tools/christmas-fireplace';
import { DEFAULT_CONFIG } from '@/tools/christmas-fireplace/index';

export default function TestChristmasFireplace() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}