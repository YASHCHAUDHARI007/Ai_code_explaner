'use server';

import { aiProjectOverview, type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { explainCodeLineByLine, type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { debugCode, type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';

export async function getProjectOverview(code: string): Promise<AiProjectOverviewOutput> {
  return await aiProjectOverview({ code });
}

export async function getLineByLineExplanation(code: string, language?: string): Promise<CodeExplanationOutput> {
  return await explainCodeLineByLine({ code, language });
}

export async function getDebugAnalysis(code: string, language: string): Promise<DebugCodeOutput> {
  return await debugCode({ code, language });
}