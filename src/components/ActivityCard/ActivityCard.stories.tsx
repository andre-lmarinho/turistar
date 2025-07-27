import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ActivityCard } from '@/components';
import type { Activity, DayPlan } from '@/types';

const sampleActivity: Activity & { dayId?: string } = {
  id: '1',
  title: 'Visit museum',
  color: 'red',
  duration: 2,
  budget: 20,
  imageUrl: 'https://placehold.co/400x200',
};

const sampleDays: DayPlan[] = [
  { id: 'd1', label: 'Day 1', activities: [] },
  { id: 'd2', label: 'Day 2', activities: [] },
];

const meta = {
  title: 'Components/ActivityCard',
  component: ActivityCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activity: sampleActivity,
    availableDays: sampleDays,
    onChangeDay: () => {},
    onChangePosition: () => {},
    bgColor: '',
    onChangeColor: () => {},
    onDelete: () => {},
    onApplyCatalogItem: () => {},
  },
};
