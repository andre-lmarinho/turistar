// src/features/planner/ui/popups/CardColorsPopup.tsx
'use client';

import React, { useRef, useState } from 'react';
import { DEFAULT_COLORS } from '@/features/planner/domain/constants/colors';
import { MAX_FILE_SIZE } from '@/shared/constants/ui';
import { Button } from '@/shared/ui/button';
import CloseButton from '@/shared/ui/button-icons/CloseButton';
import Popup from '@/shared/ui/popups/Popup';

interface CardColorsPopupProps {
  imageUrl: string;
  onChangeImage: (url: string) => void;
  onClearImage: () => void;
  selectedColor: string;
  onChangeColor: (color: string) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
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
  triggerRef,
}: CardColorsPopupProps) {
  const [tempImageUrl, setTempImageUrl] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Popup
      triggerRef={triggerRef}
      onClose={onClose}
      className="w-[304px]"
      aria-labelledby="card-color-popup-title"
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="card-color-popup-title" className="font-bold">
          Card Background
        </h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="gap-4 p-4">
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
          <Button
            size="sm"
            variant="muted"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>

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
    </Popup>
  );
}
