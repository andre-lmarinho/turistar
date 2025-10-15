import Image from 'next/image';
import hero from '../media/hero-app-mock.webp';

export function HeroImage() {
  return (
    <div className="mx-auto max-w-[min(1003px,100%)] justify-self-center lg:mx-0 lg:mr-[calc(50%-50vw-1.5rem)] lg:max-w-none lg:justify-self-auto">
      <div className="border-default bg-muted/30 block rounded-2xl border border-dashed p-1">
        <Image src={hero} alt="" className="block" aria-hidden="true" width={1003} height={522} />
      </div>
    </div>
  );
}
