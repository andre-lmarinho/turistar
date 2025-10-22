'use client';

import { useMutation } from '@tanstack/react-query';

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';
import { generateClientActivityId } from '@/features/planner/domain/utils/activityPlaceholders';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';

type AddActivityVariables = {
  dayId: string;
  title: string;
  index?: number;
};

type AddActivityContext = {
  tempId: string;
  dayId: string;
  position?: string;
  index?: number;
};

type PlannerActivity = Activity & {
  _optimistic?: boolean;
  _tempId?: string;
};

function createTempId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return `temp_${cryptoApi.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `temp_${Math.random().toString(36).slice(2, 10)}`;
}

export function useAddActivity() {
  const { insertActivityAt, replaceActivity, removeActivity } = usePlannerContext();

  return useMutation<Activity, Error, AddActivityVariables, AddActivityContext>({
    mutationFn: async ({ title }) => {
      return {
        id: generateClientActivityId(),
        title: title.trim(),
        color: '',
      };
    },
    onMutate: ({ dayId, title, index }) => {
      const trimmedTitle = title.trim();
      const tempId = createTempId();
      const optimisticActivity: PlannerActivity = {
        id: tempId,
        title: trimmedTitle,
        color: '',
        _optimistic: true,
        _tempId: tempId,
      };
      const inserted = insertActivityAt(dayId, optimisticActivity, index);
      return {
        tempId,
        dayId,
        position: inserted?.position,
        index,
      };
    },
    onSuccess: (result, variables, context) => {
      if (!context) return;
      const trimmed = variables.title.trim();
      replaceActivity(context.dayId, context.tempId, {
        ...result,
        title: trimmed,
        position: result.position ?? context.position,
      });
    },
    onError: (error, _variables, context) => {
      if (context) {
        removeActivity(context.tempId);
      }
      console.error('Failed to add activity inline', error);
    },
  });
}
