import * as React from 'react';
import Link from 'next/link';
import { Bot, Heart } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full border-t border-border/60 bg-muted/20 py-10 text-xs text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Bot className="size-4 text-primary" />
              <span>Citeify</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Open-source AI search readiness audit tool evaluating crawler access, structured data, and answer-readiness for ChatGPT, Perplexity, and Google AI Overviews.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px]">Last updated:</span>
              <time dateTime="2026-10-27" className="text-[11px] font-medium text-foreground">
                October 27, 2026
              </time>
            </div>
          </div>

          {/* Col 2: Navigation & About */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-foreground">Product & Docs</span>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Citeify
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-foreground transition-colors">
                  Scoring Methodology
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" className="hover:text-foreground transition-colors">
                  llms.txt standard
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-foreground transition-colors">
                  Sitemap XML
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Legal */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-foreground">Trust & Policies</span>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Free Tier Stack (0 USD)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Profiles & Community */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-foreground">Verified Profiles</span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/citeify/citeify"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="size-4" />
              </a>
              <a
                href="https://twitter.com/citeify"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="size-4" />
              </a>
              <a
                href="https://linkedin.com/company/citeify"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="size-4" />
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Built with Next.js, shadcn/ui, and Radix primitives.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {currentYear} Citeify. All rights reserved. Live URLs are fetched on-demand and not stored server-side.</p>
          <p className="text-muted-foreground">
            Audits speak of readiness and best practice, never guaranteed ranking or citations.
          </p>
        </div>
      </div>
    </footer>
  );
}
