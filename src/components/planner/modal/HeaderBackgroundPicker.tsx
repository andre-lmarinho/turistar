// src/components/ui/HeaderBackgroundPicker.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DEFAULT_COLORS } from '@/constants';
import { Button } from '@/components';

interface HeaderBackgroundPickerProps {
  imageUrl: string;
  onChangeImage: (url: string) => void;
  onClearImage: () => void;
  selectedColor: string;
  onChangeColor: (color: string) => void;
  colors?: string[];
}

export default function HeaderBackgroundPicker({
  imageUrl,
  onChangeImage,
  onClearImage,
  selectedColor,
  onChangeColor,
  colors = DEFAULT_COLORS,
}: HeaderBackgroundPickerProps) {
  const [tempImageUrl, setTempImageUrl] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempImageUrl(imageUrl);
  }, [imageUrl]);

  return (
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
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onChangeColor(c)}
              className={`w-[31%] h-10 shadow-xl rounded-xs border-2 ${
                c.startsWith('#') ? '' : c
              } ${selectedColor === c ? 'ring-2 ring-black' : 'border-white'}`}
              style={c.startsWith('#') ? { backgroundColor: c } : undefined}
              aria-label={c}
            />
          ))}
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
  );
}
