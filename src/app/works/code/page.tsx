import { readContent } from '@/lib/content';
import { CodeProjectGallery } from '@/components/CodeProjectGallery';
import { CodeHeader } from './CodeHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creative Code | The Fluid Logic',
  description: 'Creative code portfolio - web applications, tools, and development projects.',
};

export default async function CodeWorksPage() {
  const content = await readContent();
  const codeProjects = content.projects.filter(
    (p) => p.discipline === 'code' || (!p.discipline && p.category?.toLowerCase().includes('code'))
  );

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <CodeHeader />

      <div className="pt-32 pb-20 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[#7ee787]">const</span>
              <span className="font-mono text-[#79c0ff]">portfolio</span>
              <span className="font-mono text-white">=</span>
              <span className="font-mono text-[#a5d6ff]">{'{'}</span>
            </div>
            <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl text-[#e6edf3] leading-[1.2]">
              <span className="text-[#79c0ff]">discipline</span>
              <span className="text-white">:</span>{' '}
              <span className="text-[#a5d6ff]">"Creative Code"</span>
              <span className="text-white">,</span>
            </h1>
            <p className="mt-6 font-mono text-sm text-[#8b949e] max-w-2xl leading-relaxed">
              {'// "Web applications, creative tools, and development projects that blend technical skill with design thinking."'}
            </p>
          </div>
        </div>
      </div>

      <CodeProjectGallery projects={codeProjects} />
    </main>
  );
}
