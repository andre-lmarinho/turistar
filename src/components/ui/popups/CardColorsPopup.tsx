// src/components/ui/popups/CardColorsPopup.tsx
'use client';

import React, { useRef, useState } from 'react';
import { DEFAULT_COLORS, COLOR_NAMES } from '@/constants';
import { Button, CloseButton } from '@/components';
import { usePopupOutsideHandler } from '@/hooks';

interface CardColorsPopupProps {
  imageUrl: string;
  onChangeImage: (url: string) => void;
  onClearImage: () => void;
  selectedColor: string;
  onChangeColor: (color: string) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  colors?: string[];
}

export default function CardColorsPopup({
  imageUrl,
  onChangeImage,
  onClearImage,
  selectedColor,
  onChangeColor,
  colors = DEFAULT_COLORS,
  onClose,
  triggerRef,
}: CardColorsPopupProps) {
  const [tempImageUrl, setTempImageUrl] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  usePopupOutsideHandler({
    popupRef,
    triggerRef,
    onClose,
  });

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-color-popup-title"
      className="bg-[var(--background)] rounded-lg shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 id="card-color-popup-title" className="font-bold">
          Card Background
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="p-4 gap-4 w-[304px] bg-white rounded-lg shadow-xl">
        {tempImageUrl && (
          <Button
            size="sm"
            variant="muted"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setTempImageUrl('');
              onClearImage();
            }}
          >
            Remove photo
          </Button>
        )}

        {/* Color Section */}
        <div className="my-4 py-4 border-b-1">
          <label className="text-xs font-bold mb-1 block">Colors</label>
          <div className="flex justify-between flex-wrap gap-2">
            {colors.map((c) => {
              const label = COLOR_NAMES[c] ?? c;
              return (
                <button
                  key={c}
                  onClick={() => onChangeColor(c)}
                  className={`w-[31%] h-10 shadow-xl rounded-xs border-2 ${
                    c.startsWith('#') ? '' : c
                  } ${selectedColor === c ? 'ring-2 ring-primary' : 'border-background'}`}
                  style={c.startsWith('#') ? { backgroundColor: c } : undefined}
                  aria-label={label}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            size="sm"
            variant="muted"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.result) {
                  const result = String(reader.result);
                  setTempImageUrl(result);
                  onChangeImage(result);
                }
              };
              reader.readAsDataURL(file);
            }}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
