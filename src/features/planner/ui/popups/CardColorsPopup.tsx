// src/features/planner/ui/popups/CardColorsPopup.tsx
'use client';

import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_COLORS } from '@/features/planner/domain/constants/colors';
import { MAX_FILE_SIZE } from '@/shared/constants/ui';

interface CardColorsPopupProps {
  imageUrl: string;
  onChangeImage: (url: string) => void;
  onClearImage: () => void;
  selectedColor: string;
  onChangeColor: (color: string) => void;
  onClose: () => void;
  colors?: typeof DEFAULT_COLORS;
}

export default function CardColorsPopup({
  imageUrl,
  onChangeImage,
  onClearImage,
  selectedColor,
  onChangeColor,
  colors = DEFAULT_COLORS,
  onClose,
}: CardColorsPopupProps) {
  const [tempImageUrl, setTempImageUrl] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-[304px]">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="card-color-popup-title" className="font-bold">
          Card Background
        </h3>
        <button
          type="button"
          title="Close"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="gap-4 p-4">
        {tempImageUrl && (
          <button
            type="button"
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
            onClick={() => {
              setTempImageUrl('');
              onClearImage();
            }}
          >
            Remove photo
          </button>
        )}

        {/* Color Section */}
        <div className="my-4 border-b-1 py-4">
          <label htmlFor="day-select" className="text-xs font-bold">
            Colors
          </label>
          <div className="flex flex-wrap justify-between gap-2">
            {colors.map((c) => {
              const label = c.name;
              return (
                <button
                  key={c.bg}
                  onClick={() => onChangeColor(c.bg)}
                  className={`h-10 w-[31%] rounded border-2 shadow-xl ${
                    c.bg.startsWith('#') ? '' : c.bg
                  } ${selectedColor === c.bg ? 'ring-primary ring-2' : 'border-background'}`}
                  style={c.bg.startsWith('#') ? { backgroundColor: c.bg } : undefined}
                  aria-label={label}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            Upload image
          </button>

          <label htmlFor="upload-image" className="sr-only">
            Upload image
          </label>
          <input
            id="upload-image"
            name="upload-image"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > MAX_FILE_SIZE) return;
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
