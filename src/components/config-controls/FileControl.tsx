'use client';

import React from 'react';
import { Upload } from 'lucide-react';

export const FileControl = ({ label }: any) => (
    <button className="w-full flex items-center justify-center gap-2 px-3 py-5 border-dashed border-2 border-white/60 dark:border-white/20 rounded-xl text-gray-500 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50/30 transition-all text-xs group bg-white/20 backdrop-blur-sm">
        <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
        <span className="font-medium">点击上传 {label}</span>
    </button>
);
