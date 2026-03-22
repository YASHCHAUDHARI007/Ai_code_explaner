'use server';

import { groqClient } from '@/lib/groq';

export type DebugCodeOutput = {
  bugs: Array<{
    description: string;
    suggestion: string;
    explanation: string;
    lineNumber?: number;
  }>;
};

export async function debugCode(input: { code: string; language: string; mode?: 'beginner' | 'developer'; model?: string }): Promise<DebugCodeOutput> {
  const truncatedCode = input.code.slice(0, 5000);
  const mode = input.mode || 'developer';

  // Use user selected model or fallback to intelligent auto-selection
  const model = (input.model && input.model !== 'auto')
    ? input.model
    : (truncatedCode.length > 2000 || truncatedCode.split('\n').length > 50) 
      ? 'llama-3.3-70b-versatile' 
      : 'llama-3.1-8b-instant';

  const systemPrompt = mode === 'beginner'
    ? 'Find bugs in the code and explain them simply for a beginner. Suggest easy-to-understand fixes. Return JSON with a "bugs" array of {description, suggestion, explanation, lineNumber}.'
    : 'Perform deep static analysis to find subtle bugs, performance bottlenecks, and security vulnerabilities. Suggest professional-grade fixes. Return JSON with a "bugs" array of {description, suggestion, explanation, lineNumber}.';

  const response = await groqClient.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Language: ${input.language}\n\nCode:\n\n${truncatedCode}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"bugs": []}';
  try {
    return JSON.parse(content) as DebugCodeOutput;
  } catch (e) {
    return { bugs: [] };
  }
}
