import type { StaticImageData } from 'next/image';

import onboardingStepOne from './media/Onboarding_001_.jpg';
import onboardingStepTwo from './media/Onboarding_002_.jpg';
import onboardingStepThree from './media/Onboarding_003_.jpg';
import onboardingStepFour from './media/Onboarding_004_.jpg';

interface OnboardingStep {
  title: string;
  description: string;
  image: StaticImageData;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Your planner is ready',
    description: 'Dive straight into planning. Your central hub awaits.',
    image: onboardingStepOne,
  },
  {
    title: 'Rename your trip',
    description: 'Click the title and give your adventure a personal touch.',
    image: onboardingStepTwo,
  },
  {
    title: 'Set your trip budget',
    description: 'Define the total amount you’re willing to spend.',
    image: onboardingStepThree,
  },
  {
    title: 'Allocate activity budgets',
    description: 'Break down your trip budget across each experience and activity.',
    image: onboardingStepFour,
  },
];
