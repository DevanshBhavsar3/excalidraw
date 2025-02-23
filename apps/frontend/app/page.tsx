import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
