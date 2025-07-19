// src/constants/tutorial.ts

export interface TutorialStep {
  title: string;
  description: string;
  image: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Select your dates',
    description: 'Pick the perfect timeframe for your trip.',
    image: '/images/mascot_1_.webp',
  },
  {
    title: 'Browse activities',
    description: 'Explore suggestions tailored to Salvador.',
    image: '/images/background_1_.webp',
  },
  {
    title: 'Drag and drop',
    description: 'Arrange your itinerary with intuitive drag \u2013 drop.',
    image: '/images/mascot_1_.webp',
  },
  {
    title: 'Track your budget',
    description: 'Monitor expenses to stay within your limits.',
    image: '/images/background_1_.webp',
  },
  {
    title: 'Save and share',
    description: 'Keep your plan and send it to travel buddies.',
    image: '/images/mascot_1_.webp',
  },
];
