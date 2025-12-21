'use client';

import React from 'react';
import { DisplayUI } from '@/tools/galaxy-weaver';
import { DEFAULT_CONFIG } from '@/tools/galaxy-weaver/index';

export default function TestGalaxyWeaver() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}