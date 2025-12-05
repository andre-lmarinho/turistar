import { redirect } from 'next/navigation';

export default function UserSlugIndexPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  redirect(`/u/${slug}/planners`);
}
