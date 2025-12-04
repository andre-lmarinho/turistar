'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils/cn';
import { DollarSign, Hourglass } from '@/shared/ui/icon';
import { EMPTY_ACTIVITY_TITLE } from '@/features/app/planner/domain/constants/activity';

interface ActivityCardBaseProps {
  title: string;
  imageUrl?: string;
  duration?: number;
  twBg?: string;
  budget?: number;
  borderColorClass?: string;
}

export function ActivityCardBase({
  title,
  imageUrl,
  duration,
  twBg,
  budget,
  borderColorClass,
}: ActivityCardBaseProps) {
  const backgroundClass = twBg ?? 'bg-background';

  return (
    <div
      className={cn(
        'group relative flex w-full cursor-grab flex-col items-stretch overflow-hidden rounded-lg border border-b-3 text-left transition',
        borderColorClass,
        backgroundClass
      )}
    >
      {/* Image */}
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          width={400}
          height={200}
          className="h-30 w-full rounded-t-lg object-cover"
        />
      )}

      <div className="px-3 pt-2 pb-1">
        {/* Title */}
        <h4 className="mb-1 text-sm">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>

        {/* Meta */}
        {(duration! > 0 || budget! > 0) && (
          <div className="mb-1 flex gap-2 rounded-full text-xs">
            {duration! > 0 && (
              <span className="inline-flex items-center gap-1">
                <Hourglass size={12} aria-hidden="true" />
              </span>
            )}
            {budget! > 0 && (
              <span className="inline-flex items-center gap-1">
                <DollarSign size={12} aria-hidden="true" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
