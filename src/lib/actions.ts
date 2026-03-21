'use server';

import { aiProjectOverview, type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { explainCodeLineByLine, type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { debugCode, type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { analyzeRuntimeError, type ErrorAnalysisOutput } from '@/ai/flows/ai-error-analysis-flow';

export async function getProjectOverview(code: string): Promise<AiProjectOverviewOutput> {
  return await aiProjectOverview({ code });
}

export async function getLineByLineExplanation(code: string, language?: string): Promise<CodeExplanationOutput> {
  return await explainCodeLineByLine({ code, language });
}

export async function getDebugAnalysis(code: string, language: string): Promise<DebugCodeOutput> {
  return await debugCode({ code, language });
}

export async function getErrorAnalysis(code: string, errorMessage: string, language: string): Promise<ErrorAnalysisOutput> {
  return await analyzeRuntimeError({ errorCode: code, errorMessage, language });
}
