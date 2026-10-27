import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Citeify',
  description: 'Citeify privacy practices: zero personal data collected, no cookies, on-demand audits.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 py-12 flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
        <Badge variant="secondary" className="w-fit text-xs font-semibold">
          Privacy Policy
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Zero Tracking. Zero Cookie Retention.
        </h1>
        <p>
          Citeify respects your privacy and operates under strict privacy-by-design standards:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>No Cookies:</strong> We do not set tracking, marketing, or advertising cookies.</li>
          <li><strong>No URL Storage:</strong> Submitted URLs are inspected on-demand to generate the live report and are never stored in a server database.</li>
          <li><strong>Client-Side Reports:</strong> Audit reports reside exclusively in your browser memory and optional local storage.</li>
          <li><strong>Rate Limiting:</strong> IP addresses are stored temporarily in volatile memory for rate-limit quota calculation and cleared automatically.</li>
        </ul>
      </main>
      <Footer />
    </div>
  );
}

