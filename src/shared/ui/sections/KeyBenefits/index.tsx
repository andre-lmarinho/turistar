import FeatureCarousel from '@/shared/ui/carousel/FeatureCarousel';
import type { FeatureCarouselFeature } from '@/shared/ui/carousel/FeatureCarousel';
import { Sparkles } from '@/shared/ui/icon';
import MarketingSection from '@/shared/ui/sections/MarketingSection';

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
        <label className="text-primary bg-primary/10 pointer-events-none inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tracking-wide select-none">
          <Sparkles className="size-4" aria-hidden="true" />
          Key benefits
        </label>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-muted-foreground mt-4 text-lg">{description}</p>
      </div>
      <FeatureCarousel features={carouselFeatures} />
    </MarketingSection>
  );
}
