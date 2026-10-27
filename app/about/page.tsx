import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, CheckCircle2, Shield, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Citeify - AI Search & SEO Audit Mission',
  description:
    'Learn why Citeify was created to help site owners navigate the transition from classic search to AI answer engines.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit text-xs font-semibold">
            About Our Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Bridging the Gap Between Search Engines and AI Answer Engines
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Search has fundamentally shifted. For over two decades, SEO was about matching keywords for ten blue links. Today, conversational models (ChatGPT, Perplexity, Gemini, Claude) read, synthesize, and cite only the most authoritative, machine-accessible sources.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/70 bg-card/60">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="font-bold text-base text-foreground flex items-center gap-2">
                <Bot className="size-4 text-primary" /> The Problem
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most site owners do not know whether modern AI answer crawlers can reach their pages, whether their content is trapped inside client-side JS app shells, or if their schema markup connects to verified knowledge graphs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/60">
            <CardContent className="p-6 flex flex-col gap-2">
              <span className="font-bold text-base text-foreground flex items-center gap-2">
                <Shield className="size-4 text-primary" /> The Solution
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Citeify provides an instant, transparent audit assessing 30 AI SEO checks and 21 classic SEO factors, delivering prioritized recommendations with copy-paste code snippets.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-4 text-xs leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">Our 100% Free-Tier Architecture</h2>
          <p>
            Citeify was engineered from day one to operate entirely within free-tier, open-source constraints: Next.js App Router, SSRF-safe edge fetching, client-side report assembly, client-side PDF/Markdown generation, and zero server storage of audited URLs.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

