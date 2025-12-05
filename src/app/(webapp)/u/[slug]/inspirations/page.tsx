import type { Metadata } from 'next';

import { InspirationGallery } from '@/features/app/user/dashboard/InspirationGallery';

export const metadata: Metadata = {
  title: 'Inspirations | Turistar App',
};

export default function UserInspirationsPage() {
  return <InspirationGallery />;
}
