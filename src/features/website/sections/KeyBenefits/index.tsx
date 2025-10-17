import { FeatureCarousel } from './components/FeatureCarousel';
import type { FeatureCarouselFeature } from './components/FeatureCarousel';
import { Sparkles } from '@/shared/ui/icon';
import { Section, Container } from '@/features/website/ui/wrapper';
import { H2, P, Eyebrow } from '@/features/website/ui/typography';
import { CTAButton } from '@/features/website/ui/button';
import feature01 from './media/feature_01.webp';
import feature02 from './media/feature_02.webp';
import feature03 from './media/feature_03.webp';

const CAROUSEL_IMAGE_SOURCES = [feature01.src, feature02.src, feature03.src] as const;

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
    <Section>
      <Container>
        <Eyebrow>
          <Sparkles className="size-4" aria-hidden="true" />
          Key benefits
        </Eyebrow>
        <H2>{title}</H2>
        <P>{description}</P>
        <CTAButton />
      </Container>
      <FeatureCarousel features={carouselFeatures} />
    </Section>
  );
}
