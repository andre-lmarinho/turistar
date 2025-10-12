import Link from 'next/link';

import FeatureCarousel from '@/shared/ui/carousel/FeatureCarousel';
import type { FeatureCarouselFeature } from '@/shared/ui/carousel/FeatureCarousel';
import { Sparkles } from '@/shared/ui/icon';
import MarketingSection from '@/features/website/ui/section/Wrapper';

const CAROUSEL_IMAGE_SOURCES = [
  '/images/home/feature_01.webp',
  '/images/home/feature_02.webp',
  '/images/home/feature_03.webp',
] as const;

type KeyBenefit = Pick<FeatureCarouselFeature, 'title' | 'description'>;

export interface KeyBenefitsProps {
  title: string;
  description: string;
  benefits: KeyBenefit[];
}

export default function KeyBenefits({ title, description, benefits }: KeyBenefitsProps) {
  const carouselFeatures: FeatureCarouselFeature[] = benefits.map((benefit, index) => ({
    ...benefit,
    imgSrc: CAROUSEL_IMAGE_SOURCES[index % CAROUSEL_IMAGE_SOURCES.length],
  }));

  return (
    <MarketingSection>
      <div className="mb-12 max-w-xl">
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <Sparkles className="size-4" aria-hidden="true" />
          Key benefits
        </label>
        <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold">{title}</h2>
        <p className="text-muted-foreground mt-4 text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5]">
          {description}
        </p>
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Get started
        </Link>
      </div>
      <FeatureCarousel features={carouselFeatures} />
    </MarketingSection>
  );
}
