import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Citeify',
  description: 'Terms of Service and legal disclaimers for using Citeify.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 py-12 flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
        <Badge variant="secondary" className="w-fit text-xs font-semibold">
          Terms of Service
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Terms & Ethical Disclaimer
        </h1>
        <p>
          By accessing and using Citeify, you agree to the following terms:
        </p>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-foreground">
          <strong>No Guarantee of Ranking or AI Citations:</strong> This service evaluates readiness and best practices according to observable heuristics. No ranking, indexing, citation, or answer inclusion by third-party search engines (Google, OpenAI, Perplexity, Anthropic, Microsoft) is promised or guaranteed.
        </div>
        <p>
          You agree not to use Citeify to perform unauthorized denial-of-service scans against protected targets or attempt server-side request forgery (SSRF) bypasses.
        </p>
      </main>
      <Footer />
    </div>
  );
}

