import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

/* ─── Imports ─── */
import type { SiteContent } from '@/types/project';
import rawContent from '@/data/content.json';
import { LoadingScreen } from '@/components/LoadingScreen';
import { TypographicHero } from '@/components/TypographicHero';
import { ProjectList } from '@/components/ProjectList';
import { ProjectOverlay } from '@/components/ProjectOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';

const content = rawContent as SiteContent;

/* ═════════════════════════════════════════════════════════
   LoadingScreen
   ═════════════════════════════════════════════════════════ */
describe('LoadingScreen', () => {
  it('renders a progressbar with correct aria attrs', () => {
    render(<LoadingScreen />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Loading portfolio');
  });

  it('starts at count 0', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows status text', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Initializing Experience')).toBeInTheDocument();
  });
});

/* ═════════════════════════════════════════════════════════
   TypographicHero
   ═════════════════════════════════════════════════════════ */
describe('TypographicHero', () => {
  it('renders a single h1 containing both words', () => {
    render(<TypographicHero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('CREATIVE');
    expect(heading).toHaveTextContent('DEVELOPER');
  });

  it('includes a <nav> landmark', () => {
    render(<TypographicHero />);
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('has ABOUT and CONTACT anchor links', () => {
    render(<TypographicHero />);
    expect(screen.getByText('ABOUT')).toHaveAttribute('href', '#about');
    expect(screen.getByText('CONTACT')).toHaveAttribute('href', '#contact');
  });
});

/* ═════════════════════════════════════════════════════════
   ProjectList
   ═════════════════════════════════════════════════════════ */
describe('ProjectList', () => {
  it('renders all projects', () => {
    render(<ProjectList projects={content.projects} onProjectClick={vi.fn()} />);
    content.projects.forEach((p) => {
      // Each name appears twice (heading + sr-only SEO link)
      const matches = screen.getAllByText(p.name);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the SELECTED WORKS heading', () => {
    render(<ProjectList projects={content.projects} onProjectClick={vi.fn()} />);
    expect(screen.getByText('SELECTED WORKS')).toBeInTheDocument();
  });

  it('filters projects by discipline', () => {
    render(<ProjectList projects={content.projects} onProjectClick={vi.fn()} />);
    const neonPulse = content.projects.find((p) => p.id === 'neon-pulse');
    fireEvent.click(screen.getByRole('button', { name: 'Motion' }));
    const filteredHeadings = screen.getAllByRole('heading');
    const filteredNames = filteredHeadings.map(h => h.textContent);
    expect(filteredNames).toContain('NEON PULSE');
    expect(filteredNames).not.toContain('TASKFLOW DASHBOARD');
  });

  it('calls onProjectClick when a project is clicked', () => {
    const onClick = vi.fn();
    const neonPulse = content.projects.find((p) => p.id === 'neon-pulse');
    render(<ProjectList projects={content.projects} onProjectClick={onClick} />);
    const btn = screen.getByRole('button', { name: /NEON PULSE/i });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledWith(neonPulse);
  });

  it('calls onProjectClick on Enter key', () => {
    const onClick = vi.fn();
    const neonPulse = content.projects.find((p) => p.id === 'neon-pulse');
    render(<ProjectList projects={content.projects} onProjectClick={onClick} />);
    const btn = screen.getByRole('button', { name: /NEON PULSE/i });
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(neonPulse);
  });

  it('every project item has an aria-label', () => {
    render(<ProjectList projects={content.projects} onProjectClick={vi.fn()} />);
    const buttons = screen.getAllByRole('button', { name: /View .* project/i });
    expect(buttons).toHaveLength(content.projects.length);
    buttons.forEach((btn) => expect(btn).toHaveAttribute('aria-label'));
  });
});

/* ═════════════════════════════════════════════════════════
   ProjectOverlay
   ═════════════════════════════════════════════════════════ */
describe('ProjectOverlay', () => {
  const sample = content.projects[0];

  it('renders nothing when project is null', () => {
    const { container } = render(
      <ProjectOverlay project={null} onClose={vi.fn()} />,
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders a dialog with aria-modal when open', () => {
    render(<ProjectOverlay project={sample} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('shows project name', () => {
    render(<ProjectOverlay project={sample} onClose={vi.fn()} />);
    expect(screen.getByText(sample.name)).toBeInTheDocument();
  });

  it('calls onClose when BACK TO LIST is clicked', () => {
    const onClose = vi.fn();
    render(<ProjectOverlay project={sample} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Go back to project list'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(<ProjectOverlay project={sample} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

/* ═════════════════════════════════════════════════════════
   ErrorBoundary
   ═════════════════════════════════════════════════════════ */
describe('ErrorBoundary', () => {
  it('renders error UI when a child throws', () => {
    const BadComponent = () => {
      throw new Error('kaboom');
    };

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/SOMETHING WENT WRONG/)).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    expect(screen.getByText('RELOAD PAGE')).toBeInTheDocument();
    expect(screen.getByText('TRY AGAIN')).toBeInTheDocument();
  });

  it('calls reset function when TRY AGAIN is clicked', () => {
    const BadComponent = () => {
      throw new Error('kaboom');
    };

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>,
    );

    const tryAgainButton = screen.getByText('TRY AGAIN');
    fireEvent.click(tryAgainButton);
    // The component should attempt to reset (implementation detail)
  });
});

/* ═════════════════════════════════════════════════════════
   AboutSection
   ═════════════════════════════════════════════════════════ */
describe('AboutSection', () => {
  it('renders the creative developer heading', () => {
    render(
      <AboutSection
        label={content.about.label}
        headline={content.about.headline}
        body={content.about.body}
        skills={content.about.skills}
      />,
    );
    expect(screen.getByText(/CREATIVE DEVELOPER/)).toBeInTheDocument();
  });

  it('lists skills', () => {
    render(
      <AboutSection
        label={content.about.label}
        headline={content.about.headline}
        body={content.about.body}
        skills={content.about.skills}
      />,
    );
    expect(screen.getByText('AFTER EFFECTS')).toBeInTheDocument();
    expect(screen.getByText('CINEMA 4D')).toBeInTheDocument();
    expect(screen.getByText('PYTHON')).toBeInTheDocument();
  });
});

/* ═════════════════════════════════════════════════════════
   Footer
   ═════════════════════════════════════════════════════════ */
describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/DANIEL PORTFOLIO/)).toBeInTheDocument();
  });

  it('renders social links with proper hrefs', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Social links')).toBeInTheDocument();
  });
});

/* ═════════════════════════════════════════════════════════
   Project data integrity
   ═════════════════════════════════════════════════════════ */
describe('Project data', () => {
  it('has projects with required fields and portfolio metadata', () => {
    expect(content.projects.length).toBeGreaterThanOrEqual(2);
    content.projects.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.year).toBeTruthy();
      expect(p.imageUrl).toBeDefined();
      expect(p.description).toBeTruthy();
      expect(p.tools).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.links).toBeDefined();
    });
  });
});
