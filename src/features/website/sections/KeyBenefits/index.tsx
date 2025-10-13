import { FeatureCarousel } from './components/FeatureCarousel';
import type { FeatureCarouselFeature } from './components/FeatureCarousel';
import { Sparkles } from '@/shared/ui/icon';
import { Wrapper } from '@/features/website/ui/section/Wrapper';
import { Button } from '@/shared/ui/button';

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

export function KeyBenefits({ title, description, benefits }: KeyBenefitsProps) {
  const carouselFeatures: FeatureCarouselFeature[] = benefits.map((benefit, index) => ({
    ...benefit,
    imgSrc: CAROUSEL_IMAGE_SOURCES[index % CAROUSEL_IMAGE_SOURCES.length],
  }));

  return (
    <Wrapper>
      <div className="mb-12 flex max-w-xl flex-col items-start gap-4">
        <p className="eyebrow">
          <Sparkles className="size-4" aria-hidden="true" />
          Key benefits
        </p>
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold">{title}</h2>
        <p className="text-muted-foreground text-[clamp(1rem,2.2vw,1.125rem)] leading-[1.5]">
          {description}
        </p>
        <Button href="/signup">Get started</Button>
      </div>
      <FeatureCarousel features={carouselFeatures} />
    </Wrapper>
  );
}
