'use server';

import { aiProjectOverview, type AiProjectOverviewOutput } from '@/ai/flows/ai-project-overview';
import { explainCodeLineByLine, type CodeExplanationOutput } from '@/ai/flows/ai-line-by-line-explanation';
import { debugCode, type DebugCodeOutput } from '@/ai/flows/ai-debugging-assistant-flow';
import { analyzeRuntimeError, type ErrorAnalysisOutput } from '@/ai/flows/ai-error-analysis-flow';
import { detectLanguage, type LanguageDetectionOutput } from '@/ai/flows/ai-language-detection-flow';
import { askCodeQuestion, type ChatOutput } from '@/ai/flows/ai-chat-flow';

export async function getProjectOverview(code: string, mode?: 'beginner' | 'developer', model?: string): Promise<AiProjectOverviewOutput> {
  return await aiProjectOverview({ code, mode, model });
}

export async function getLineByLineExplanation(code: string, language?: string, mode?: 'beginner' | 'developer', model?: string): Promise<CodeExplanationOutput> {
  return await explainCodeLineByLine({ code, language, mode, model });
}

export async function getDebugAnalysis(code: string, language: string, mode?: 'beginner' | 'developer', model?: string): Promise<DebugCodeOutput> {
  return await debugCode({ code, language, mode, model });
}

export async function getErrorAnalysis(code: string, errorMessage: string, language: string, model?: string): Promise<ErrorAnalysisOutput> {
  return await analyzeRuntimeError({ errorCode: code, errorMessage, language, model });
}

export async function getDetectedLanguage(code: string): Promise<LanguageDetectionOutput> {
  return await detectLanguage({ code });
}

export async function getAiAnswer(code: string, question: string, language?: string, model?: string): Promise<ChatOutput> {
  return await askCodeQuestion({ code, question, language, model });
}

/**
 * Basic GitHub fetcher
 */
export async function fetchGitHubRepo(url: string): Promise<string> {
  try {
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) throw new Error('Invalid GitHub URL');
    
    const [owner, repo] = parts;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Failed to fetch repository metadata');
    
    const contents = await res.json();
    if (!Array.isArray(contents)) throw new Error('Repository is empty or invalid');

    const codeFiles = contents.filter(f => f.type === 'file' && /\.(ts|tsx|js|jsx|py|java|c|cpp|go|rb|php)$/.test(f.name)).slice(0, 5);
    
    let combinedCode = '';
    for (const file of codeFiles) {
      const fileRes = await fetch(file.download_url);
      if (fileRes.ok) {
        const text = await fileRes.text();
        combinedCode += `// File: ${file.name}\n${text}\n\n`;
      }
    }

    return combinedCode || "// No relevant code files found in the root directory.";
  } catch (err: any) {
    throw new Error(`GitHub Fetch Error: ${err.message}`);
  }
}
