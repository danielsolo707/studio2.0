"use client"

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ExternalLink, Github, BookOpen, PlayCircle, ChevronRight, Terminal } from 'lucide-react';
import type { Project } from '@/types/project';
import {
  DISCIPLINE_LABELS,
  getProjectDiscipline,
  getProjectLinks,
  getProjectRole,
  getProjectStatus,
  LINK_TYPE_LABELS,
  STATUS_LABELS,
} from '@/lib/project-meta';

interface CodeProjectGalleryProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function CodeProjectGallery({ projects, onProjectClick }: CodeProjectGalleryProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleProjectClick = useCallback(
    (project: Project) => {
      if (onProjectClick) {
        onProjectClick(project);
        return;
      }
      router.push(`/projects/${project.id}`);
    },
    [onProjectClick, router],
  );

  const getLinkIcon = (type: string) => {
    if (type === 'github') return <Github size={14} />;
    if (type === 'notebook') return <BookOpen size={14} />;
    if (type === 'video') return <PlayCircle size={14} />;
    return <ExternalLink size={14} />;
  };

  const parseProofPoints = (description: string) => {
    const points: { label: string; value: string }[] = [];
    const labels = ['Objective:', 'Approach:', 'Outcome:', 'Next Step:'];
    labels.forEach((label) => {
      const regex = new RegExp(`${label}[\\s\\n]([\\s\\S]*?)(?=${labels.join('|')}|$)`, 'i');
      const match = description.match(regex);
      if (match && match[1]?.trim()) {
        points.push({ label: label.replace(': ', ''), value: match[1].trim() });
      }
    });
    return points;
  };

  return (
    <section className="min-h-screen bg-[#0d1117]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <motion.div
          className="mb-12 pb-8 border-b border-[#30363d]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-[#58a6ff]" />
            <span className="font-mono text-[12px] text-[#8b949e]">~/projects</span>
          </div>
          <h1 className="font-mono text-3xl md:text-4xl text-[#e6edf3]">
            <span className="text-[#7ee787]">const</span> <span className="text-[#79c0ff]">projects</span>{' '}
            <span className="text-[#e6edf3]">=</span>{' '}
            <span className="text-[#a5d6ff]">[</span>
          </h1>
          <p className="font-mono text-sm text-[#8b949e] mt-2">
            <span className="text-[#a5d6ff]">{projects.length}</span> repositories found
          </p>
        </motion.div>

        <div className="space-y-4">
          {projects.map((project, index) => {
            const discipline = getProjectDiscipline(project);
            const status = getProjectStatus(project);
            const role = getProjectRole(project);
            const links = getProjectLinks(project);
            const proofPoints = parseProofPoints(project.description || '');
            const isExpanded = expandedId === project.id;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`border rounded-lg overflow-hidden transition-colors cursor-pointer ${
                  isExpanded
                    ? 'border-[#58a6ff] bg-[#161b22]'
                    : 'border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] hover:bg-[#161b22]'
                }`}
                onClick={() => {
                  if (isExpanded) {
                    handleProjectClick(project);
                  } else {
                    setExpandedId(project.id);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isExpanded) {
                      handleProjectClick(project);
                    } else {
                      setExpandedId(project.id);
                    }
                  }
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-mono text-lg md:text-xl text-[#e6edf3] truncate">
                          {project.name}
                        </h3>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono rounded ${
                          status === 'case-study'
                            ? 'bg-[#238636]/20 text-[#7ee787]'
                            : status === 'prototype'
                            ? 'bg-[#1f6feb]/20 text-[#58a6ff]'
                            : 'bg-[#8b949e]/20 text-[#8b949e]'
                        }`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>

                      <p className="font-mono text-sm text-[#8b949e] line-clamp-2 mb-3">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                        <span className="flex items-center gap-1.5 text-[#7ee787]">
                          <span className="w-2 h-2 rounded-full bg-[#7ee787]" />
                          {DISCIPLINE_LABELS[discipline]}
                        </span>
                        <span className="text-[#8b949e]">{role}</span>
                        <span className="text-[#6e7681]">•</span>
                        <span className="text-[#8b949e]">{project.year}</span>
                        <span className="text-[#6e7681]">•</span>
                        <span className="text-[#8b949e]">{project.tools}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {links.slice(0, 2).map((link) => (
                        <a
                          key={`${link.type}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-9 h-9 rounded border border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] transition-colors"
                          aria-label={`Open ${link.label || LINK_TYPE_LABELS[link.type]}`}
                        >
                          {getLinkIcon(link.type)}
                        </a>
                      ))}
                      <span className={`w-9 h-9 rounded border border-[#30363d] flex items-center justify-center text-[#8b949e] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#30363d] bg-[#0d1117]"
                  >
                    <div className="p-6">
                      {proofPoints.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-mono text-[10px] tracking-[0.2em] text-[#58a6ff] mb-3 uppercase">
                            Project Details
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {proofPoints.map((point) => (
                              <div key={point.label} className="p-4 rounded bg-[#161b22] border border-[#30363d]">
                                <span className="font-mono text-[11px] text-[#8b949e] block mb-1">
                                  {point.label}:
                                </span>
                                <span className="font-mono text-sm text-[#e6edf3]">
                                  {point.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {links.length > 2 && (
                        <div className="mb-6">
                          <h4 className="font-mono text-[10px] tracking-[0.2em] text-[#58a6ff] mb-3 uppercase">
                            Additional Links
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {links.slice(2).map((link) => (
                              <a
                                key={`${link.type}-${link.url}`}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-9 items-center gap-2 border border-[#30363d] px-4 font-mono text-[11px] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#58a6ff] transition-colors rounded"
                              >
                                {getLinkIcon(link.type)}
                                {link.label || LINK_TYPE_LABELS[link.type]}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-mono text-[12px] rounded transition-colors"
                      >
                        View Full Project
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {projects.length === 0 && (
            <div className="py-16 text-center border border-dashed border-[#30363d] rounded-lg">
              <p className="font-mono text-[12px] tracking-[0.3em] text-[#8b949e]">
                NO CODE PROJECTS YET
              </p>
              <p className="font-mono text-sm text-[#6e7681] mt-2">
                {'/* add projects via dashboard */'}
              </p>
            </div>
          )}
        </div>

        <motion.div
          className="mt-12 pt-8 border-t border-[#30363d]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-mono text-[11px] text-[#6e7681]">
            {'}'} <span className="text-[#e6edf3]">{`/* ${projects.length} projects */`}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}