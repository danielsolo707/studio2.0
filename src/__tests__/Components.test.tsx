import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

/* ─── Imports ─── */
import type { SiteContent } from '@/lib/content';
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
    expect(heading).toHaveTextContent('MOTION');
    expect(heading).toHaveTextContent('DESIGNER');
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
  it('renders all 4 projects', () => {
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

  it('calls onProjectClick when a project is clicked', () => {
    const onClick = vi.fn();
    render(<ProjectList projects={content.projects} onProjectClick={onClick} />);
    // Use getAllByText and click the heading (first match)
    fireEvent.click(screen.getAllByText('CHROME FLOW')[0]);
    expect(onClick).toHaveBeenCalledWith(content.projects[0]);
  });

  it('calls onProjectClick on Enter key', () => {
    const onClick = vi.fn();
    render(<ProjectList projects={content.projects} onProjectClick={onClick} />);
    const btn = screen.getByLabelText(/CHROME FLOW/i);
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(content.projects[0]);
  });

  it('every project item has an aria-label', () => {
    render(<ProjectList projects={content.projects} onProjectClick={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
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
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>SAFE CONTENT</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('SAFE CONTENT')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    const Bomb = () => {
      throw new Error('kaboom');
    };
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    // In jsdom, WebGL is not supported → ErrorBoundary shows GRAPHICS ERROR
    expect(screen.getByText(/GRAPHICS ERROR|SOMETHING WENT WRONG/)).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    expect(screen.getByText('RELOAD')).toBeInTheDocument();
    expect(screen.getByText('GO BACK')).toBeInTheDocument();

    spy.mockRestore();
  });
});

/* ═════════════════════════════════════════════════════════
   AboutSection
   ═════════════════════════════════════════════════════════ */
describe('AboutSection', () => {
  it('renders the "CRAFTING DIGITAL MOVEMENT" heading', () => {
    render(
      <AboutSection
        label={content.about.label}
        headline={content.about.headline}
        body={content.about.body}
        skills={content.about.skills}
      />,
    );
    expect(screen.getByText(/CRAFTING/)).toBeInTheDocument();
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
    expect(screen.getByText('BLENDER')).toBeInTheDocument();
    expect(screen.getByText('CINEMA 4D')).toBeInTheDocument();
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
    expect(screen.getByText('Instagram')).toHaveAttribute('href', 'https://instagram.com');
    expect(screen.getByText('Vimeo')).toHaveAttribute('href', 'https://vimeo.com');
  });
});

/* ═════════════════════════════════════════════════════════
   Project data integrity
   ═════════════════════════════════════════════════════════ */
describe('Project data', () => {
  it('has 4 projects with required fields', () => {
    expect(content.projects).toHaveLength(4);
    content.projects.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.year).toBeTruthy();
      expect(p.imageUrl).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.tools).toBeTruthy();
      expect(p.category).toBeTruthy();
    });
  });
});
