import { TypographicHero } from '@/components/TypographicHero';
import { ProjectSection } from '@/components/ProjectSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ParticlesBackground } from '@/components/ParticlesBackground';
import { readContent } from '@/lib/content';

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
        <TypographicHero />
        <ProjectSection projects={content.projects} />
        <AboutSection
          label={content.about.label}
          headline={content.about.headline}
          body={content.about.body}
          skills={content.about.skills}
        />
        <ContactSection />
      </div>
    </main>
  );
}
