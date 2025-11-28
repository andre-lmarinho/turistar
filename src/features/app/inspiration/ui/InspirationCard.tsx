import type { InspirationItem } from '@/features/app/inspiration/data';
import { Card } from '@/shared/ui/card';

type InspirationCardProps = InspirationItem & {
  hrefPrefix?: string;
};

export function InspirationCard({
  slug,
  title,
  image,
  hrefPrefix = '/p/inspiration',
}: InspirationCardProps) {
  return <Card href={`${hrefPrefix}/${slug}`} title={title} image={image} />;
}
