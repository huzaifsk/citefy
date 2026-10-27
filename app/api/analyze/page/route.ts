import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { safeFetch } from '@/lib/fetcher/safe-fetch';
import { checkRateLimit } from '@/lib/rate-limit/limiter';
import { evaluateRenderability } from '@/lib/checks/renderability';
import { evaluateStructuredData } from '@/lib/checks/structured-data';
import { evaluateAnswerReady } from '@/lib/checks/answer-ready';
import { evaluateEntityTrust } from '@/lib/checks/entity-trust';
import { evaluateClassicOnPage } from '@/lib/checks/classic-onpage';
import { evaluateClassicTechnical } from '@/lib/checks/classic-technical';
import { evaluateClassicSocial } from '@/lib/checks/classic-social';
import * as cheerio from 'cheerio';
import { CheckResult, PageAnalyzeResponse } from '@/types/audit';

const requestSchema = z.object({
  url: z.string().min(3).max(2048),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        { code: 'RATE_LIMITED', message: rateLimit.error || 'Rate limit exceeded.' },
        { status: 429 }
      );
    }

    // 2. Body parsing and URL validation
    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_URL', message: 'Please provide a valid URL string.' },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // 3. Execute SSRF-safe fetch
    const fetchResult = await safeFetch(url);
    if (!fetchResult.ok) {
      return NextResponse.json(
        {
          code: fetchResult.errorCode || 'FETCH_FAILED',
          message: fetchResult.error || 'Failed to fetch the requested webpage.',
          redirectChain: fetchResult.redirectChain,
        },
        { status: 400 }
      );
    }

    // Check content-type: must be HTML
    if (
      fetchResult.contentType &&
      !fetchResult.contentType.includes('text/html') &&
      !fetchResult.contentType.includes('application/xhtml+xml')
    ) {
      return NextResponse.json(
        {
          code: 'NOT_HTML',
          message: `Expected HTML content, but received "${fetchResult.contentType}".`,
        },
        { status: 400 }
      );
    }

    const html = fetchResult.body;
    const finalUrl = fetchResult.finalUrl;
    const $ = cheerio.load(html);

    // 4. Run structured data extraction
    const { checks: structuredChecks, report: structuredReport } = evaluateStructuredData({
      html,
      targetUrl: finalUrl,
    });

    // 5. Run renderability checks
    const renderabilityChecks = evaluateRenderability({
      html,
      targetUrl: finalUrl,
    });

    // 6. Run answer-ready content checks
    const answerChecks = evaluateAnswerReady({
      html,
      hasFaqSchema: structuredReport.types.includes('FAQPage'),
    });

    // 7. Run entity and trust checks
    const entityChecks = evaluateEntityTrust({
      html,
      targetUrl: finalUrl,
      schemaTypes: structuredReport.types,
      schemaAuthor: undefined,
    });

    // 8. Run classic on-page checks
    const onPageChecks = evaluateClassicOnPage({
      html,
      targetUrl: url,
      finalUrl,
    });

    // 9. Run classic technical checks
    const technicalChecks = await evaluateClassicTechnical({
      html,
      targetUrl: url,
      finalUrl,
      httpStatus: fetchResult.status,
      redirectChain: fetchResult.redirectChain,
      headers: fetchResult.headers,
    });

    // 10. Run classic social metadata checks
    const socialChecks = evaluateClassicSocial({
      html,
      targetUrl: finalUrl,
    });

    // Aggregate all page-level checks
    const allPageChecks: CheckResult[] = [
      ...renderabilityChecks,
      ...structuredChecks,
      ...answerChecks,
      ...entityChecks,
      ...onPageChecks,
      ...technicalChecks,
      ...socialChecks,
    ];

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

    const responsePayload: PageAnalyzeResponse = {
      finalUrl,
      redirectChain: fetchResult.redirectChain,
      headers: fetchResult.headers,
      status: fetchResult.status,
      timingMs: fetchResult.timingMs,
      contentLength: fetchResult.contentLength,
      checks: allPageChecks,
      structuredData: structuredReport,
      rawTextStats: {
        wordCount,
        headingsCount: $('h1, h2, h3, h4, h5, h6').length,
        paragraphsCount: $('p').length,
        imagesCount: $('img').length,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred during page analysis.' },
      { status: 500 }
    );
  }
}

