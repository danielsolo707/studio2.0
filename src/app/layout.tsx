
import type {Metadata} from 'next';
import { Inter, Syncopate } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'The Fluid Logic | Cinematic Motion Design',
  description: 'A cinematic motion design portfolio experience.',
  keywords: ['motion design', 'portfolio', '3D graphics', 'web animation', 'Three.js'],
  authors: [{ name: 'Daniel Solo' }],
  icons: {
    icon: '/wave.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://motionverse.design',
    title: 'The Fluid Logic | Cinematic Motion Design',
    description: 'A cinematic motion design portfolio experience featuring immersive 3D graphics and smooth animations.',
    siteName: 'The Fluid Logic',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MotionVerse Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Fluid Logic | Cinematic Motion Design',
    description: 'A cinematic motion design portfolio experience featuring immersive 3D graphics and smooth animations.',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://motionverse.design'),
};

/**
 * JSON-LD Schema.org structured data for SEO
 */
const portfolioSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://motionverse.design/#person',
  name: 'Daniel Solo',
  url: 'https://motionverse.design',
  email: 'hello@daniel.design',
  jobTitle: 'Motion Design Artist',
  description: 'Cinematic motion design and 3D graphics specialist',
  image: {
    '@type': 'ImageObject',
    url: 'https://motionverse.design/og-image.png',
    width: 1200,
    height: 630
  },
  knowsAbout: [
    'Motion Graphics',
    '3D Animation',
    'Web Animation',
    'WebGL',
    'After Effects',
    'Cinema 4D',
    'Blender',
    'Unreal Engine'
  ],
  sameAs: [
    'https://instagram.com',
    'https://vimeo.com'
  ]
};

const portfolioCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MotionVerse Portfolio',
  description: 'A curated collection of cinematic motion design projects',
  url: 'https://motionverse.design',
  creator: {
    '@id': 'https://motionverse.design/#person'
  },
  author: {
    '@id': 'https://motionverse.design/#person'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${syncopate.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Portfolio Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
        />
        {/* Portfolio Collection Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioCollectionSchema) }}
        />
      </head>
      <body
        className="font-body antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
