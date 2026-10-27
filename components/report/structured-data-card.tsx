'use client';

import * as React from 'react';
import { StructuredDataReport } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Network, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface StructuredDataCardProps {
  structuredData: StructuredDataReport;
}

export function StructuredDataCard({ structuredData }: StructuredDataCardProps) {
  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Code2 className="size-4 text-primary" />
              Detected Structured Data (JSON-LD)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Schema.org entity graphs utilized by LLMs for factual grounding and citation mapping
            </CardDescription>
          </div>
          <Badge
            variant={structuredData.valid ? 'default' : 'destructive'}
            className="text-xs"
          >
            {structuredData.present
              ? structuredData.valid
                ? `${structuredData.itemsCount} Valid Entities`
                : 'Syntax Errors'
              : 'No JSON-LD Found'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Declared Entity Types */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-foreground">Declared Schema Types:</span>
          {structuredData.types.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {structuredData.types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs font-mono px-2 py-0.5">
                  @{type}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No schema types declared. Add JSON-LD (e.g. WebSite, Organization, Article) to ground your entities.
            </p>
          )}
        </div>

        {/* Entity Linking (sameAs) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Network className="size-3.5 text-primary" />
              Knowledge Graph Entity Links (sameAs):
            </span>
            <span className="text-muted-foreground">
              {structuredData.sameAsLinks.length} profile link(s)
            </span>
          </div>

          {structuredData.sameAsLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {structuredData.sameAsLinks.map((link, idx) => {
                let domain = link;
                try {
                  domain = new URL(link).hostname;
                } catch {}
                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                  >
                    <span>{domain}</span>
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No sameAs profile links detected. Link to your Wikidata, Wikipedia, LinkedIn, or Twitter/X profiles to verify identity.
            </p>
          )}
        </div>

        {/* Syntax Errors if any */}
        {structuredData.syntaxErrors.length > 0 && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex flex-col gap-1">
            <span className="font-semibold flex items-center gap-1">
              <XCircle className="size-3.5" />
              JSON-LD Parsing Errors Detected:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {structuredData.syntaxErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

