'use client';

import React from 'react';
import { DisplayUI } from '@/tools/time-tunnel';
import { DEFAULT_CONFIG } from '@/tools/time-tunnel/index';

export default function TestTimeTunnel() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}