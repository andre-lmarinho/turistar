// src/shared/constants/onboarding.ts

export interface OnboardingStep {
  title: string;
  description: string;
  image: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Your planner is ready',
    description: 'Dive straight into planning. Your central hub awaits.',
    image: '/images/Onboarding_001_.jpg',
  },
  {
    title: 'Rename your trip',
    description: 'Click the title and give your adventure a personal touch.',
    image: '/images/Onboarding_002_.jpg',
  },
  {
    title: 'Set your trip budget',
    description: 'Define the total amount you’re willing to spend.',
    image: '/images/Onboarding_003_.jpg',
  },
  {
    title: 'Allocate activity budgets',
    description: 'Break down your trip budget across each experience and activity.',
    image: '/images/Onboarding_004_.jpg',
  },
  {
    title: 'Discover new adventures',
    description: 'Browse suggestions and add exciting activities to your plan.',
    image: '/images/Onboarding_005_.jpg',
  },
];
