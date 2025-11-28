'use client';

import { PopoverContent, PopoverHeader } from '@/shared/ui/popover';

interface CardColorsPopoverProps {
  titleId?: string;
  imageUrl?: string;
  onRemoveImage?: () => void;
  colors: { name: string; bg: string }[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
  uploadInputId: string;
  onUploadImage?: (file: File) => void;
}

export function CardColorsPopover({
  titleId = 'card-color-popover-title',
  imageUrl,
  onRemoveImage,
  colors,
  selectedColor,
  onSelectColor,
  uploadInputId,
  onUploadImage,
}: CardColorsPopoverProps) {
  return (
    <PopoverContent
      side="bottom"
      align="end"
      sideOffset={8}
      className="w-[304px] p-0"
      aria-labelledby={titleId}
    >
      <PopoverHeader title="Card Background" titleId={titleId} />
      <div className="space-y-3 p-4">
        {imageUrl ? (
          <button
            type="button"
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
            onClick={onRemoveImage}
          >
            Remove photo
          </button>
        ) : null}

        <div>
          <span className="text-xs font-bold">Colors</span>
          <div className="mt-2 flex flex-wrap justify-between gap-2">
            {colors.map((color) => (
              <button
                key={color.bg}
                onClick={() => onSelectColor(color.bg)}
                className={`h-10 w-[31%] rounded border-2 shadow-xl ${
                  color.bg.startsWith('#') ? '' : color.bg
                } ${selectedColor === color.bg ? 'ring-primary ring-2' : 'border-background'}`}
                style={color.bg.startsWith('#') ? { backgroundColor: color.bg } : undefined}
                aria-label={color.name}
                type="button"
              />
            ))}
          </div>
        </div>
        <hr />
        <div>
          <label
            htmlFor={uploadInputId}
            className="border-border bg-background text-foreground hover:bg-muted/60 inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            Upload image
          </label>
          <input
            id={uploadInputId}
            name={uploadInputId}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadImage?.(file);
                event.target.value = '';
              }
            }}
            className="sr-only"
          />
        </div>
      </div>
    </PopoverContent>
  );
}
