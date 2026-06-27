import { readContent } from '@/lib/cms/content';
import { MotionProjectGallery } from '@/components/MotionProjectGallery';
import { MotionHeader } from '@/components/works/MotionHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motion Design | The Fluid Logic',
  description: 'Motion design portfolio - case studies, experiments, and visual explorations.',
};

export default async function MotionWorksPage() {
  const content = await readContent();
  const motionProjects = content.projects.filter(
    (p) => p.discipline === 'motion' || (!p.discipline && p.category?.toLowerCase().includes('motion'))
  );

  return (
    <main className="min-h-screen bg-[#0a0a0c]">
      <MotionHeader />

      <div className="pt-[165px] md:pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-[1920px] mx-auto">
          <div className="mb-16">
            <p className="font-headline text-[12px] tracking-[0.5em] text-[#DFFF00] mb-4">
              SELECTED WORKS
            </p>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter leading-[1]">
              MOTION
              <br />
              <span className="text-white/30">DESIGN</span>
            </h1>
            <p className="mt-6 font-body text-lg text-white/50 max-w-2xl leading-relaxed">
              Case studies, experiments, and visual explorations in motion graphics,
              3D animation, and cinematic design.
            </p>
          </div>
        </div>
      </div>

      <MotionProjectGallery projects={motionProjects} />
    </main>
  );
}
