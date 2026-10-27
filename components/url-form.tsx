'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const urlSchema = z.object({
  url: z
    .string()
    .min(3, 'Please enter a URL')
    .refine((val) => {
      let testVal = val.trim();
      if (!/^https?:\/\//i.test(testVal)) testVal = `https://${testVal}`;
      try {
        const u = new URL(testVal);
        const host = u.hostname.toLowerCase();
        if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.internal') || host.endsWith('.local')) {
          return false;
        }
        return ['http:', 'https:'].includes(u.protocol) && host.includes('.');
      } catch {
        return false;
      }
    }, 'Enter a valid public domain or URL (e.g. example.com or https://example.com)'),
});

type FormData = z.infer<typeof urlSchema>;

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  initialUrl?: string;
}

const SAMPLE_URLS = [
  'https://stripe.com',
  'https://nextjs.org',
  'https://docs.anthropic.com',
  'https://en.wikipedia.org',
];

export function UrlForm({ onSubmit, isLoading, errorMessage, initialUrl = '' }: UrlFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: initialUrl,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    let normalized = data.url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    onSubmit(normalized);
  };

  const handleSampleClick = (sample: string) => {
    setValue('url', sample, { shouldValidate: true });
    onSubmit(sample);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full flex flex-col sm:flex-row items-stretch gap-2.5 p-1.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"
      >
        <div className="relative flex-1 flex items-center">
          <Globe className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            {...register('url')}
            type="text"
            placeholder="Enter website URL (e.g. yoursite.com or https://...)"
            disabled={isLoading}
            aria-label="Website URL"
            className="h-11 pl-10 pr-3 border-0 bg-transparent focus-visible:ring-0 text-sm md:text-base placeholder:text-muted-foreground/70"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 px-6 rounded-lg font-medium active:scale-[0.98] transition-transform duration-150 ease-out"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Auditing Site...
            </>
          ) : (
            <>
              Analyze Readiness
              <ArrowRight className="size-4" data-icon="inline-end" />
            </>
          )}
        </Button>
      </form>

      {/* Field Validation Error */}
      {errors.url && (
        <p className="text-xs text-destructive flex items-center gap-1.5 pl-2 animate-in-scale">
          <AlertCircle className="size-3.5" />
          {errors.url.message}
        </p>
      )}

      {/* Upstream / Server Error Banner */}
      {errorMessage && (
        <Alert variant="destructive" className="animate-in-scale">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-sm font-semibold">Audit Failed</AlertTitle>
          <AlertDescription className="text-xs mt-1 leading-normal">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Sample URL Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
          <Sparkles className="size-3 text-primary" /> Try sample:
        </span>
        {SAMPLE_URLS.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleClick(sample)}
            className="px-2.5 py-1 rounded-md border border-border/70 bg-secondary/50 hover:bg-secondary text-secondary-foreground text-xs transition-colors active:scale-[0.97]"
          >
            {sample.replace('https://', '')}
          </button>
        ))}
      </div>
    </div>
  );
}

