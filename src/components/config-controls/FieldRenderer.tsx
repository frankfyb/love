'use client';

import React from 'react';
import type { GenericConfigItemMetadata } from '@/types/genericConfig';
import { Label } from './primitives';
import { InputControl } from './InputControl';
import { TextareaControl } from './TextareaControl';
import { CustomSelectControl } from './SelectControl';
import { SelectInputControl } from './SelectInputControl';
import { StickerPickerControl } from './StickerPickerControl';
import { MediaGridControl } from './MediaGridControl';
import { MediaPickerControl } from './MediaPickerControl';
import { ListBuilderControl } from './ListBuilderControl';
import { RadioGroupControl } from './RadioControl';
import { SwitchControl } from './SwitchControl';
import { SliderControl } from './SliderControl';
import { ColorControl } from './ColorControl';
import { DateTimeControl } from './DateTimeControl';
import { StickerGridControl } from './StickerGridControl';
import { MultiSelectControl } from './MultiSelectControl';
import { FileControl } from './FileControl';

/**
 * 字段渲染器 — 根据 metadata.type 分发到具体控件
 */
export const FieldRenderer = <T,>({
    itemKey, configValue, allConfig, metadata, onChange, extraData
}: {
    itemKey: keyof T;
    configValue: any;
    allConfig: T;
    metadata: GenericConfigItemMetadata<T>;
    onChange: (key: keyof T, val: any) => void;
    extraData?: any;
}) => {
    if (metadata.condition && !metadata.condition(allConfig)) return null;

    const commonProps = {
        value: configValue,
        onChange: (val: any) => onChange(itemKey, val),
        ...metadata,
        extraData,
        timeType: metadata.timeType
    };

    let Control;
    switch (metadata.type) {
        case 'input': Control = InputControl; break;
        case 'textarea': Control = TextareaControl; break;
        case 'select': Control = CustomSelectControl; break;
        case 'select-input': Control = SelectInputControl; break;
        case 'sticker-picker': Control = StickerPickerControl; break;
        case 'media-grid': Control = MediaGridControl; break;
        case 'media-picker': Control = MediaPickerControl; break;
        case 'list': Control = ListBuilderControl; break;
        case 'radio': Control = RadioGroupControl; break;
        case 'switch': Control = SwitchControl; break;
        case 'slider': Control = SliderControl; break;
        case 'color': Control = ColorControl; break;
        case 'datetime': Control = DateTimeControl; break;
        case 'sticker-grid': Control = StickerGridControl; break;
        case 'multi-select': Control = MultiSelectControl; break;
        case 'file': Control = FileControl; break;
        default: Control = InputControl;
    }

    return (
        <div className="mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <Label description={metadata.description}>{metadata.label}</Label>
                {metadata.type === 'switch' && (
                    // @ts-ignore
                    <Control {...commonProps} />
                )}
            </div>
            {metadata.type !== 'switch' && (
                // @ts-ignore
                <Control {...commonProps} />
            )}
        </div>
    );
};
