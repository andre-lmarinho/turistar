import type { StaticImageData } from 'next/image';

import onboardingStepOne from './media/onboarding_001_.jpg';
import onboardingStepTwo from './media/onboarding_002_.jpg';
import onboardingStepThree from './media/onboarding_003_.jpg';
import onboardingStepFour from './media/onboarding_004_.jpg';

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
    description: 'Define the total amount you are willing to spend.',
    image: onboardingStepThree,
  },
  {
    title: 'Allocate activity budgets',
    description: 'Break down your trip budget across each experience and activity.',
    image: onboardingStepFour,
  },
];
