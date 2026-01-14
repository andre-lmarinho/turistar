import { CtaFinal } from "@/features/website/sections/CTAFinal";
import { HeroAgencies } from "@/features/website/sections/Hero";
import { KeyBenefits } from "@/features/website/sections/KeyBenefits";
import { Testimonial } from "@/features/website/sections/Testimonial";
import { TrustedBy } from "@/features/website/sections/TrustedBy";
import { UseCases } from "@/features/website/sections/UseCases";

export default function AgencyPage() {
  return (
    <>
      <HeroAgencies />
      <TrustedBy />
      <KeyBenefits
        title="Serve clients better"
        description="Streamline your agency's workflow by organizing, visualizing and budgeting trips in one place."
        benefits={[
          {
            title: "Optimize operations quickly",
            description:
              "Use drag and drop planning to update itineraries without spreadsheets. Save time and reduce mistakes with real time saving across your team.",
          },
          {
            title: "Visualize journeys clearly",
            description:
              "Present routes, destinations and schedules on an interactive map. Help clients picture their trip and make informed decisions faster during consultations.",
          },
          {
            title: "Manage client budgets",
            description:
              "Organize costs by service, accommodation and transport. Provide transparent totals and adjust quickly to meet financial expectations for your customers.",
          },
        ]}
      />
      <UseCases />
      <Testimonial />
      <CtaFinal />
    </>
  );
}
