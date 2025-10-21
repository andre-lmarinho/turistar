import Image from 'next/image';

import { Plane, Kanban, LandPlot } from '@/shared/ui/icon';
import mock from '../media/app-mock.webp';

const FEATURES = [
  {
    Icon: Plane,
    title: 'Build your full itinerary',
    description: 'Create and organize travel days with activities, schedules, and personal notes.',
  },
  {
    Icon: Kanban,
    title: 'Drag and drop your ideas',
    description: 'Rearrange days and activities with an intuitive visual interface.',
  },
  {
    Icon: LandPlot,
    title: 'See everything in one place',
    description: 'View your plan, budget, and map in a single integrated view.',
  },
] as const;

export const SignupShowcase = () => (
  <div className="border-border lg:bg-muted/30 mx-auto mt-24 w-full max-w-2xl flex-col justify-between rounded-l-2xl pl-4 lg:mt-0 lg:flex lg:max-w-full lg:border lg:py-12 lg:pl-12">
    <div className="border-default bg-muted/30 hidden rounded-tl-2xl rounded-br-none rounded-bl-2xl border border-r-0 border-dashed lg:block lg:py-[6px] lg:pl-[6px]">
      <Image src={mock} alt="" className="block" aria-hidden="true" width={681} height={520} />
    </div>
    <div className="mt-8 mr-12 hidden h-full w-full grid-cols-3 gap-4 overflow-hidden lg:grid">
      {FEATURES.map(({ Icon, title, description }) => (
        <div key={title} className="mb-8 flex max-w-52 flex-col leading-none sm:mb-0">
          <div className="items-center">
            <Icon className="size-4" aria-hidden="true" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <p>{description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
