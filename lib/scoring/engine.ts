import {
  AuditScores,
  CategoryId,
  CategoryScore,
  CheckResult,
  GradeLevel,
} from '@/types/audit';
import { SCORING_CONFIG } from '@/config/weights';

export function getGradeFromScore(score: number): GradeLevel {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs work';
  return 'Poor';
}

export function calculateAuditScores(checks: CheckResult[]): AuditScores {
  const baseCategoryWeights: Record<CategoryId, number> = {
    A: SCORING_CONFIG.aiCategoryWeights.A ?? 20,
    B: SCORING_CONFIG.aiCategoryWeights.B ?? 15,
    C: SCORING_CONFIG.aiCategoryWeights.C ?? 20,
    D: SCORING_CONFIG.aiCategoryWeights.D ?? 25,
    E: SCORING_CONFIG.aiCategoryWeights.E ?? 15,
    Freshness: SCORING_CONFIG.aiCategoryWeights.Freshness ?? 5,
    F: SCORING_CONFIG.classicCategoryWeights.F ?? 30,
    G: SCORING_CONFIG.classicCategoryWeights.G ?? 25,
    H: SCORING_CONFIG.classicCategoryWeights.H ?? 25,
    LinksImages: SCORING_CONFIG.classicCategoryWeights.LinksImages ?? 10,
    I: SCORING_CONFIG.classicCategoryWeights.I ?? 10,
  };

  const categoriesMap: Record<CategoryId, CategoryScore> = {
    A: {
      id: 'A',
      name: SCORING_CONFIG.categoryNames.A,
      section: 'ai',
      weight: baseCategoryWeights.A,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    B: {
      id: 'B',
      name: SCORING_CONFIG.categoryNames.B,
      section: 'ai',
      weight: baseCategoryWeights.B,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    C: {
      id: 'C',
      name: SCORING_CONFIG.categoryNames.C,
      section: 'ai',
      weight: baseCategoryWeights.C,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    D: {
      id: 'D',
      name: SCORING_CONFIG.categoryNames.D,
      section: 'ai',
      weight: baseCategoryWeights.D,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    E: {
      id: 'E',
      name: SCORING_CONFIG.categoryNames.E,
      section: 'ai',
      weight: baseCategoryWeights.E,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    Freshness: {
      id: 'Freshness',
      name: SCORING_CONFIG.categoryNames.Freshness,
      section: 'ai',
      weight: baseCategoryWeights.Freshness,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    F: {
      id: 'F',
      name: SCORING_CONFIG.categoryNames.F,
      section: 'classic',
      weight: baseCategoryWeights.F,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    G: {
      id: 'G',
      name: SCORING_CONFIG.categoryNames.G,
      section: 'classic',
      weight: baseCategoryWeights.G,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    H: {
      id: 'H',
      name: SCORING_CONFIG.categoryNames.H,
      section: 'classic',
      weight: baseCategoryWeights.H,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    LinksImages: {
      id: 'LinksImages',
      name: SCORING_CONFIG.categoryNames.LinksImages,
      section: 'classic',
      weight: baseCategoryWeights.LinksImages,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
    I: {
      id: 'I',
      name: SCORING_CONFIG.categoryNames.I,
      section: 'classic',
      weight: baseCategoryWeights.I,
      score: 100,
      unroundedScore: 100,
      isExcluded: false,
      passedCount: 0,
      warnCount: 0,
      failCount: 0,
      infoCount: 0,
    },
  };

  const categoryScoresData: Record<
    CategoryId,
    { totalWeightedEarned: number; totalWeightPossible: number }
  > = {
    A: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    B: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    C: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    D: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    E: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    Freshness: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    F: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    G: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    H: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    LinksImages: { totalWeightedEarned: 0, totalWeightPossible: 0 },
    I: { totalWeightedEarned: 0, totalWeightPossible: 0 },
  };

  for (const check of checks) {
    const cat = check.category;
    const catData = categoriesMap[cat];
    if (!catData) continue;

    if (check.status === 'pass') catData.passedCount++;
    else if (check.status === 'warn') catData.warnCount++;
    else if (check.status === 'fail') catData.failCount++;
    else catData.infoCount++;

    // "info" and "not-applicable" are strictly excluded from scoring (affect neither numerator nor denominator)
    if (check.status !== 'info' && check.status !== 'not-applicable') {
      const sevWeight = SCORING_CONFIG.severityWeights[check.severity] || 1;
      const pointEarned =
        check.status === 'pass'
          ? SCORING_CONFIG.statusScores.pass
          : check.status === 'warn'
            ? SCORING_CONFIG.statusScores.warn
            : SCORING_CONFIG.statusScores.fail;

      categoryScoresData[cat].totalWeightedEarned += pointEarned * sevWeight;
      categoryScoresData[cat].totalWeightPossible += sevWeight;
    }
  }

  // 1. Calculate each category score:
  // If a category has no scored checks, mark it excluded.
  for (const catId of Object.keys(categoryScoresData) as CategoryId[]) {
    const data = categoryScoresData[catId];
    if (data.totalWeightPossible > 0) {
      const unrounded = (data.totalWeightedEarned / data.totalWeightPossible) * 100;
      categoriesMap[catId].unroundedScore = unrounded;
      categoriesMap[catId].score = Math.round(unrounded);
      categoriesMap[catId].isExcluded = false;
    } else {
      categoriesMap[catId].unroundedScore = 0;
      categoriesMap[catId].score = 0;
      categoriesMap[catId].isExcluded = true;
    }
  }

  // 2. Renormalize and calculate section score for AI SEO:
  // Spec: "If a category has no scored checks, exclude it and renormalize the remaining category weights to 100."
  const aiCats: CategoryId[] = ['A', 'B', 'C', 'D', 'E', 'Freshness'];
  const activeAiCats = aiCats.filter((c) => !categoriesMap[c].isExcluded);
  const totalActiveAiWeight = activeAiCats.reduce(
    (sum, c) => sum + baseCategoryWeights[c],
    0
  );

  let unroundedAiScore = 0;
  if (totalActiveAiWeight > 0) {
    for (const c of activeAiCats) {
      // Renormalize category weight for display / inspectability
      categoriesMap[c].weight = Number(
        ((baseCategoryWeights[c] / totalActiveAiWeight) * 100).toFixed(2)
      );
      unroundedAiScore +=
        (categoriesMap[c].unroundedScore ?? 0) * (baseCategoryWeights[c] / totalActiveAiWeight);
    }
  }

  // 3. Renormalize and calculate section score for Classic SEO:
  const classicCats: CategoryId[] = ['F', 'G', 'H', 'LinksImages', 'I'];
  const activeClassicCats = classicCats.filter((c) => !categoriesMap[c].isExcluded);
  const totalActiveClassicWeight = activeClassicCats.reduce(
    (sum, c) => sum + baseCategoryWeights[c],
    0
  );

  let unroundedClassicScore = 0;
  if (totalActiveClassicWeight > 0) {
    for (const c of activeClassicCats) {
      categoriesMap[c].weight = Number(
        ((baseCategoryWeights[c] / totalActiveClassicWeight) * 100).toFixed(2)
      );
      unroundedClassicScore +=
        (categoriesMap[c].unroundedScore ?? 0) *
        (baseCategoryWeights[c] / totalActiveClassicWeight);
    }
  }

  // 4. Calculate Overall Score: 0.65 x AI + 0.35 x Classic
  // If one entire section is empty, renormalize to the active section
  let unroundedOverallScore = 0;
  if (totalActiveAiWeight > 0 && totalActiveClassicWeight > 0) {
    unroundedOverallScore =
      unroundedAiScore * SCORING_CONFIG.overallWeights.ai +
      unroundedClassicScore * SCORING_CONFIG.overallWeights.classic;
  } else if (totalActiveAiWeight > 0) {
    unroundedOverallScore = unroundedAiScore;
  } else if (totalActiveClassicWeight > 0) {
    unroundedOverallScore = unroundedClassicScore;
  } else {
    unroundedOverallScore = 0;
  }

  // 5. Critical Override Check:
  // Spec: "if AI-02 or AI-04 fails (AI search bots blocked) or AI-05 shows noindex, the AI SEO grade is capped at 'Needs work' and a red banner explains why."
  const ai02 = checks.find((c) => c.id === 'AI-02');
  const ai04 = checks.find((c) => c.id === 'AI-04');
  const ai05 = checks.find((c) => c.id === 'AI-05');

  let criticalOverride = false;
  let overrideReason: string | undefined;

  if (ai02?.status === 'fail') {
    criticalOverride = true;
    overrideReason = 'Critical search and answer bots are blocked in robots.txt.';
  } else if (ai04?.status === 'fail') {
    criticalOverride = true;
    overrideReason = 'AI crawler user-agents are blocked at the CDN or firewall (WAF challenge / 403 / 429).';
  } else if (ai05?.status === 'fail') {
    criticalOverride = true;
    overrideReason = 'Page contains "noindex" directives, blocking search and AI indexing.';
  }

  // Compute unrounded and rounded display grades
  let aiGrade = getGradeFromScore(unroundedAiScore);
  const classicGrade = getGradeFromScore(unroundedClassicScore);
  let overallGrade = getGradeFromScore(unroundedOverallScore);

  // Apply critical override to AI SEO grade and Overall grade
  if (criticalOverride) {
    if (aiGrade === 'Excellent' || aiGrade === 'Good') {
      aiGrade = 'Needs work';
    }
    if (overallGrade === 'Excellent' || overallGrade === 'Good') {
      overallGrade = 'Needs work';
    }
  }

  return {
    overall: Math.round(unroundedOverallScore),
    unroundedOverall: unroundedOverallScore,
    ai: Math.round(unroundedAiScore),
    unroundedAi: unroundedAiScore,
    classic: Math.round(unroundedClassicScore),
    unroundedClassic: unroundedClassicScore,
    grade: overallGrade,
    aiGrade,
    classicGrade,
    criticalOverride,
    overrideReason,
    categories: categoriesMap,
  };
}

/**
 * Computes priority fixes:
 * Spec: "Priority of a fix = severity weight x category weight, with effort shown beside it."
 * Filtered to failed and warned checks, sorted descending by priorityScore.
 */
export function extractPriorityFixes(
  checks: CheckResult[],
  categories: Record<CategoryId, CategoryScore>
): CheckResult[] {
  const issues = checks.filter((c) => c.status === 'fail' || c.status === 'warn');

  const scoredIssues = issues.map((check) => {
    const sevWeight = SCORING_CONFIG.severityWeights[check.severity] || 1;
    const catWeight = categories[check.category]?.weight || 10;
    const priorityScore = sevWeight * catWeight;

    return {
      ...check,
      priorityScore,
    };
  });

  // Sort descending by priorityScore, with fail before warn on tie
  scoredIssues.sort((a, b) => {
    const scoreDiff = (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    if (a.status === 'fail' && b.status !== 'fail') return -1;
    if (b.status === 'fail' && a.status !== 'fail') return 1;
    return 0;
  });

  return scoredIssues;
}
