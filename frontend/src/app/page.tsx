import type { Metadata } from "next"
import Hero from '@/features/home/components/Hero'
import FeaturesGrid from '@/features/home/components/FeaturesGrid'
import Testimonials from '@/features/home/components/Testimonials'
import PainPointsSection from '@/features/home/components/PainPointsSection'
import HowItWorksSection from '@/features/home/components/HowItWorksSection'
import VideoShowcaseSection from '@/features/home/components/VideoShowcaseSection'
import CosmicCtaSection from '@/features/home/components/CosmicCtaSection'
import Footer from '@/features/home/components/Footer'

const shareImage = {
  url: "/img/bg.png",
  width: 1802,
  height: 872,
  alt: "Sharaco, devis et facturation",
}

export const metadata: Metadata = {
  openGraph: {
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [shareImage.url],
  },
}

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-slate-950">
      <Hero />
      
      <FeaturesGrid />
      <HowItWorksSection />
      <VideoShowcaseSection />
      <CosmicCtaSection />
      
      <Footer />
    </div>
  )
}
