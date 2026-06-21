import { Header } from "@/components/Header";
import { Marquee } from "@/components/Marquee";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { OperatingModes } from "@/components/OperatingModes";
import { SystemSpecs } from "@/components/SystemSpecs";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export function LandingView() {
  return (
    <>
      <Header />
      <Marquee />
      <Hero />
      <Manifesto />
      <OperatingModes />
      <SystemSpecs />
      <FAQ />
      <Footer />
    </>
  );
}
