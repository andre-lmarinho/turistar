'use client';

import { motion } from 'framer-motion';

import { PlannerBoard } from './dnd/PlannerBoard';
import { BudgetBoard } from './budget/BudgetBoard';
import { MapBoard } from './map/MapBoard';

import type { Entry } from '@/features/planner/types/budget';

export type PlannerMode = 'planner' | 'map' | 'budget';

const modeOrder: PlannerMode[] = ['planner', 'map', 'budget'];

interface PlannerModeDeckProps {
  mode: PlannerMode;
  onModeChange: (mode: PlannerMode) => void;
  persist: boolean;
  initialBudget?: number;
  initialEntries?: Entry[];
}

export function PlannerModeDeck({
  mode,
  onModeChange,
  persist,
  initialBudget,
  initialEntries,
}: PlannerModeDeckProps) {
  const activeIdx = modeOrder.indexOf(mode);

  return (
    <div className="relative order-2 mx-auto w-full max-w-screen-xl flex-1 overflow-visible md:order-3">
      {modeOrder.map((currentMode, idx) => {
        const isActive = idx === activeIdx;
        const relativeIndex = idx - activeIdx;
        const distance = Math.abs(relativeIndex);
        const zIndex = 3 - distance;
        const offsetMap = [0, 6, 10];
        const scaleMap = [1, 0.92, 0.87];
        const opacityMap = [1, 0.92, 0.8];
        const offset = offsetMap[distance] * Math.sign(relativeIndex);
        const scale = scaleMap[distance] ?? 0.7;
        const opacity = opacityMap[distance] ?? 0.6;
        const rotateZ = relativeIndex * 2;

        return (
          <motion.div
            key={currentMode}
            data-testid={`mode-card-${currentMode}`}
            className={`absolute inset-0 ${!isActive ? 'cursor-pointer' : ''}`}
            style={{ zIndex: zIndex }}
            initial={false}
            animate={{ x: `${offset}%`, scale, opacity, rotateZ }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={() => !isActive && onModeChange(currentMode)}
          >
            <div style={{ pointerEvents: isActive ? 'auto' : 'none' }} className="h-full">
              {currentMode === 'planner' && <PlannerBoard />}
              {currentMode === 'budget' && (
                <BudgetBoard
                  initialBudget={initialBudget}
                  initialEntries={initialEntries}
                  persist={persist}
                />
              )}
              {currentMode === 'map' && <MapBoard />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
