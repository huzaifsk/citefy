import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://citeify.app'),
  title: 'Citeify - AI Search & SEO Audit Tool',
  description:
    'Paste any URL to get an instant AI search readiness score, crawler matrix, structured data validation, and prioritized fix checklist.',
  keywords: [
    'AI SEO',
    'ChatGPT Search',
    'PerplexityBot',
    'OAI-SearchBot',
    'Schema JSON-LD',
    'AI Search Readiness',
    'SEO Audit Tool',
  ],
  authors: [{ name: 'Citeify Engineering Team', url: 'https://citeify.app/about' }],
  creator: 'Citeify',
  publisher: 'Citeify',
  alternates: {
    canonical: 'https://citeify.app',
    languages: {
      'en-US': 'https://citeify.app',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Citeify - AI Search & SEO Audit Tool',
    description:
      'Paste any URL to get an instant AI search readiness score, crawler matrix, structured data validation, and prioritized fix checklist.',
    url: 'https://citeify.app',
    siteName: 'Citeify',
    type: 'website',
    images: [
      {
        url: 'https://citeify.app/og.png',
        width: 1200,
        height: 630,
        alt: 'Citeify AI Search Readiness & SEO Audit Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citeify - AI Search & SEO Audit Tool',
    description:
      'Evaluate your website readiness for ChatGPT Search, Perplexity, Google AI Overviews, and Copilot.',
    images: ['https://citeify.app/og.png'],
    creator: '@citeify',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Citeify',
  applicationCategory: 'WebApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Paste any URL to get an instant AI search readiness score, crawler matrix, structured data validation, and prioritized fix checklist.',
  url: 'https://citeify.app',
  author: {
    '@type': 'Organization',
    name: 'Citeify',
    url: 'https://citeify.app',
    sameAs: [
      'https://github.com/citeify/citeify',
      'https://twitter.com/citeify',
      'https://linkedin.com/company/citeify',
    ],
  },
  datePublished: '2026-01-01',
  dateModified: '2026-10-27',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
