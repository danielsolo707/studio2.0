"use client"

import React from 'react';
import { ProjectList } from '@/components/ProjectList';
import type { Project } from '@/types/project';

/**
 * Renders the project list section.
 * Clicking a project navigates to /projects/{slug}.
 */
export function ProjectSection({ projects }: { projects: Project[] }) {
  return (
    <div className="relative z-20">
      <ProjectList projects={projects} />
    </div>
  );
}
