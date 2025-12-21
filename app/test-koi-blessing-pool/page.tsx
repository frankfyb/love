'use client';

import React from 'react';
import { DisplayUI } from '@/tools/koi-blessing-pool';
import { DEFAULT_CONFIG } from '@/tools/koi-blessing-pool/index';

export default function TestKoiBlessingPool() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}