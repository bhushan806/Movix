import { HeroSection } from "@/components/landing/HeroSection";
import { StatsRibbon } from "@/components/landing/StatsRibbon";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600/20">
      <HeroSection />
      <div className="relative z-20 -mt-16 md:-mt-20">
         <StatsRibbon />
      </div>
      <FeatureGrid />
      <HowItWorks />
      <CTASection />
    </div>
  );
}
