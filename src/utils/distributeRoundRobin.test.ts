import { describe, it, expect } from 'vitest';
import { distributeRoundRobin } from './distributeRoundRobin';
import { DayPlan, Activity } from "@/types/itinerary";
import { MAX_ACTIVITIES_PER_DAY } from "@/constants/planner";

function makeDays(count: number): DayPlan[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `day-${i}`,
    label: `Day ${i}`,
    activities: []
  }));
}

function makeActivities(count: number): Activity[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `act-${i}`,
    title: `Activity ${i}`,
    duration: 60,
    description: ''
  }));
}

describe('distributeRoundRobin', () => {
  it('evenly distributes activities across days', () => {
    const days = makeDays(3);
    const activities = makeActivities(8);
    const result = distributeRoundRobin(days, activities);
    const counts = result.map(d => d.activities.length);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  it('never exceeds MAX_ACTIVITIES_PER_DAY per day', () => {
    const days = makeDays(2);
    const activities = makeActivities(10); // 2 days * MAX = 10
    const result = distributeRoundRobin(days, activities);
    result.forEach(day => {
      expect(day.activities.length).toBeLessThanOrEqual(MAX_ACTIVITIES_PER_DAY);
    });
  });
});
