import PlanForm from '@/features/home/components/PlanForm';

export interface PlanFormSectionProps {
  id?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function PlanFormSection({
  id,
  title,
  description,
  className,
}: PlanFormSectionProps) {
  return (
    <section id={id} className="py-16">
      <PlanForm className={className} title={title} description={description} />
    </section>
  );
}
