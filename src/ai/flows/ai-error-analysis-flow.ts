'use server';

import { groqClient } from '@/lib/groq';

export type ErrorAnalysisOutput = {
  explanation: string;
  rootCause: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
};

export async function analyzeRuntimeError(input: { errorCode: string; errorMessage: string; language: string; model?: string }): Promise<ErrorAnalysisOutput> {
  const truncatedError = input.errorMessage.slice(0, 3000);
  const truncatedCode = input.errorCode.slice(0, 3000);

  // Use user selected model or fallback to intelligent auto-selection
  const model = (input.model && input.model !== 'auto')
    ? input.model
    : (truncatedCode.length > 2500 || truncatedError.length > 1000) 
      ? 'llama-3.3-70b-versatile' 
      : 'llama-3.1-8b-instant';

  const response = await groqClient.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a senior DevOps and debugging expert. Analyze the provided error message and the corresponding code. Identify the root cause and provide a clear solution. Return JSON with keys: "explanation", "rootCause", "solution", "severity" (low/medium/high).',
      },
      {
        role: 'user',
        content: `Language: ${input.language}\n\nCode Context:\n${truncatedCode}\n\nError/Stack Trace:\n${truncatedError}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      explanation: parsed.explanation || "No explanation available",
      rootCause: parsed.rootCause || "Unknown root cause",
      solution: parsed.solution || "No specific solution suggested",
      severity: parsed.severity || "medium",
    };
  } catch (e) {
    return {
      explanation: "Analysis failed to parse",
      rootCause: "Technical error during analysis",
      solution: "Please check the console for details",
      severity: "medium",
    };
  }
}
