import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PlannerClient from '@/app/planner/PlannerClient';
import Providers from '@/components/Providers';

const meta = {
  title: 'Components/PlannerClient',
  component: PlannerClient,
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof PlannerClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
