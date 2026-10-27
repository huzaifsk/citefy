import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { GithubIcon } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Citeify - Support & Feedback',
  description: 'Get in touch with the Citeify team for questions, issues, or suggestions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-3xl px-4 sm:px-6 py-12 flex flex-col gap-6 text-xs text-muted-foreground leading-relaxed">
        <Badge variant="secondary" className="w-fit text-xs font-semibold">
          Contact & Community
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Get in Touch
        </h1>
        <p>
          Have questions regarding the audit heuristics, suggestions for new AI crawler definitions, or encountered a false positive? We welcome feedback:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="https://github.com/citeify/citeify/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors flex items-center gap-3 text-foreground"
          >
            <GithubIcon className="size-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">GitHub Issues</span>
              <span className="text-[11px] text-muted-foreground">Report bugs & heuristic suggestions</span>
            </div>
          </a>

          <a
            href="mailto:contact@citeify.app"
            className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors flex items-center gap-3 text-foreground"
          >
            <Mail className="size-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Email Support</span>
              <span className="text-[11px] text-muted-foreground">contact@citeify.app</span>
            </div>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
