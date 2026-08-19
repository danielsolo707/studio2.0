import type { Metadata } from 'next';
import { TypographicHero } from '@/components/sections/home/TypographicHero';
import { FeaturedProjects } from '@/components/sections/home/FeaturedProjects';
import { AboutSection } from '@/components/sections/about/AboutSection';
import { ContactSection } from '@/components/sections/contact/ContactSection';
import { LoadingScreen } from '@/components/sections/shared/LoadingScreen';
import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { PublicAssistantFloatingButton } from '@/components/hermes/PublicAssistantFloatingButton';
import { readContent } from '@/lib/cms/content';

// Refresh featured project list from Supabase without requiring a full redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Daniel Soleimani | ML Engineer & Applied AI Builder',
  description:
    'Portfolio of Daniel Soleimani: machine learning, multimodal systems, tool-using AI agents, and interactive products built from experiment to production-minded delivery.',
  openGraph: {
    title: 'Daniel Soleimani | ML Engineer & Applied AI Builder',
    description:
      'Machine learning, multimodal systems, AI agents, and interactive products built from experiment to production-minded delivery.',
  },
  alternates: { canonical: '/' },
};

/**
 * Home page — **Server Component**.
 *
 * All content is always present in the DOM so crawlers index
 * the full page. Interactive sections are Client Components
 * imported above; the LoadingScreen is a fixed overlay that
 * fades out after the intro animation completes.
 */
export default async function Home() {
  const content = await readContent();

  return (
    <main className="relative min-h-screen bg-[#030305] overflow-x-hidden">
      {/* Accessibility: skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-[#DFFF00] focus:text-black focus:font-headline focus:text-xs focus:tracking-wider"
      >
        Skip to content
      </a>

      {/* Decorative loading overlay */}
      <LoadingScreen />

      {/* Global floating particles background */}
      <ParticlesBackground />

      {/* Page sections (always in DOM for SEO) */}
      <div id="main-content">
        <TypographicHero 
          headline={content.hero?.headline || 'ML ENGINEER\n& AI BUILDER'}
          description={content.hero?.description || ''}
        />
        <FeaturedProjects projects={content.projects} maxProjects={3} />
        <AboutSection
          label={content.about.label}
          headline={content.about.headline}
          body={content.about.body}
          skills={content.about.skills}
        />
        <ContactSection />
      </div>

      <PublicAssistantFloatingButton />
    </main>
  );
}
