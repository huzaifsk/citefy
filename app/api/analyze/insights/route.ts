import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LlmInsights } from '@/types/audit';

const requestSchema = z.object({
  url: z.string(),
  scores: z.object({
    overall: z.number(),
    ai: z.number(),
    classic: z.number(),
    grade: z.string(),
    criticalOverride: z.boolean().optional(),
    overrideReason: z.string().optional(),
  }),
  topIssues: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      severity: z.string(),
      status: z.string(),
      recommendation: z.string(),
    })
  ),
  structuredDataTypes: z.array(z.string()).optional(),
  blockedBots: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_INPUT', message: 'Invalid findings format.' },
        { status: 400 }
      );
    }

    const { url, scores, topIssues, structuredDataTypes = [], blockedBots = [] } = parsed.data;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are a world-class AI Search & Answer Engine SEO Architect.
Analyze these audit findings for the URL "${url}":
- Overall Score: ${scores.overall}/100 (Grade: ${scores.grade})
- AI SEO Readiness: ${scores.ai}/100
- Classic SEO Health: ${scores.classic}/100
- Blocked AI Crawlers: ${blockedBots.length > 0 ? blockedBots.join(', ') : 'None'}
- Structured Data Types: ${structuredDataTypes.join(', ') || 'None'}
- Top Issues: ${topIssues.map((i) => `[${i.id}] ${i.title} (${i.severity}): ${i.recommendation}`).join('; ')}

Return a JSON object with:
1. "summary": A concise, 3-to-4 sentence executive overview explaining the site's readiness for ChatGPT, Perplexity, and Google AI Overviews. Speak in terms of readiness and best practice (never guarantee citations).
2. "keyTakeaways": An array of exactly 3 bullet points with the most important next actions.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsedAi = JSON.parse(rawText);
            const insights: LlmInsights = {
              summary: parsedAi.summary,
              keyTakeaways: parsedAi.keyTakeaways || [],
              isAiGenerated: true,
            };
            return NextResponse.json(insights);
          }
        }
      } catch {
        // Fall back to rule-based generator
      }
    }

    // Smart Rule-Based Fallback Synthesis
    let summary = `This page achieves an overall AI SEO readiness grade of ${scores.grade} with a score of ${scores.overall}/100. `;

    if (scores.criticalOverride) {
      summary += `Critically, access for AI answer engines is currently hindered (${scores.overrideReason || 'search bots blocked'}), capping visibility until resolved. `;
    } else if (scores.ai >= 85) {
      summary += `The page demonstrates strong technical foundations for AI discovery, including unblocked answer crawlers and accessible HTML content. `;
    } else {
      summary += `While classic on-page elements show solid coverage, AI-specific factors such as schema entity linking and inverted-pyramid answer structures require refinement. `;
    }

    if (topIssues.length > 0) {
      summary += `The highest impact improvement is resolving ${topIssues[0].title.toLowerCase()} to ensure modern LLM synthesis pipelines can cite primary source material.`;
    }

    const keyTakeaways: string[] = [];
    if (blockedBots.length > 0) {
      keyTakeaways.push(`Unblock ${blockedBots.join(', ')} in robots.txt to restore AI search indexing.`);
    } else {
      keyTakeaways.push('Maintain open crawler access for OAI-SearchBot and PerplexityBot.');
    }

    if (structuredDataTypes.length === 0) {
      keyTakeaways.push('Implement Schema.org JSON-LD (Organization/Article) with sameAs knowledge graph links.');
    } else {
      keyTakeaways.push('Enrich existing structured data with author verification and sameAs profiles.');
    }

    if (topIssues.some((i) => i.id === 'AI-19' || i.id === 'AI-18')) {
      keyTakeaways.push('Refactor key headings into conversational queries with concise 40-60 word answer capsules.');
    } else {
      keyTakeaways.push('Prioritize adding original data, statistics, and verifiable empirical facts.');
    }

    const fallbackInsights: LlmInsights = {
      summary,
      keyTakeaways: keyTakeaways.slice(0, 3),
      isAiGenerated: false,
    };

    return NextResponse.json(fallbackInsights);
  } catch (err: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err.message || 'Error generating insights.' },
      { status: 500 }
    );
  }
}

