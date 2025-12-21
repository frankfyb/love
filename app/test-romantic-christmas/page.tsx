'use client';

import React from 'react';
import { DisplayUI } from '@/tools/romantic-christmas';
import { DEFAULT_CONFIG } from '@/tools/romantic-christmas/index';

export default function TestRomanticChristmas() {
  return (
    <div className="w-full h-screen">
      <DisplayUI config={DEFAULT_CONFIG} isPanelOpen={false} />
    </div>
  );
}