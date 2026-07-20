import type {Metadata, Viewport} from 'next';
import { Inter, Syncopate, Vazirmatn } from 'next/font/google';
import { ScrollRestoration } from '@/components/layout/ScrollRestoration';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const syncopate = Syncopate({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-syncopate',
  display: 'swap',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Daniel Soleimani | AI & Machine Learning Specialist',
    template: '%s | Daniel Soleimani',
  },
  description:
    'Official portfolio of Daniel Soleimani. Discover advanced projects in Machine Learning, Deep Learning, and high-end After Effects motion design.',
  keywords: [
    'Daniel Soleimani',
    'machine learning',
    'deep learning',
    'artificial intelligence',
    'motion design',
    'After Effects',
    'ML portfolio',
    'AI specialist',
  ],
  authors: [{ name: 'Daniel Soleimani' }],
  creator: 'Daniel Soleimani',
  publisher: 'Daniel Soleimani',
  icons: {
    icon: '/wave.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.danielsoleimani.ir',
    title: 'Daniel Soleimani | AI & Machine Learning Specialist',
    description:
      'Official portfolio of Daniel Soleimani. Discover advanced projects in Machine Learning, Deep Learning, and high-end After Effects motion design.',
    siteName: 'Daniel Soleimani Portfolio',
    images: [
      {
        url: '/images/pickle-rick-plain.png',
        width: 1200,
        height: 630,
        alt: 'Daniel Soleimani — AI & ML Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daniel Soleimani | AI & Machine Learning Specialist',
    description:
      'Official portfolio of Daniel Soleimani. Discover advanced projects in Machine Learning, Deep Learning, and high-end After Effects motion design.',
    images: ['/images/pickle-rick-plain.png'],
  },
  metadataBase: new URL('https://www.danielsoleimani.ir'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * JSON-LD Schema.org structured data for SEO — Knowledge Graph binding.
 * Explicitly ties "Daniel Soleimani" to the domain so Google understands
 * who the site represents and surfaces clean Sitelinks + Knowledge Panel.
 */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Daniel Soleimani',
  url: 'https://www.danielsoleimani.ir',
  sameAs: ['https://www.danielsoleimani.me'],
  jobTitle: 'Machine Learning Specialist & Motion Designer',
  knowsAbout: [
    'Machine Learning',
    'Deep Learning',
    'Artificial Intelligence',
    'Motion Graphics',
    'Adobe After Effects',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${syncopate.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Person Schema — Google Knowledge Graph binding */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className="font-body antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
