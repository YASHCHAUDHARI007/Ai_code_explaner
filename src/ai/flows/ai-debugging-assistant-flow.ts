
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

export async function debugCode(input: { code: string; language: string; mode?: 'beginner' | 'developer' }): Promise<DebugCodeOutput> {
  const truncatedCode = input.code.slice(0, 5000);
  const mode = input.mode || 'developer';

  const systemPrompt = mode === 'beginner'
    ? 'Find bugs in the code and explain them simply for a beginner. Suggest easy-to-understand fixes. Return JSON with a "bugs" array of {description, suggestion, explanation, lineNumber}.'
    : 'Perform deep static analysis to find subtle bugs, performance bottlenecks, and security vulnerabilities. Suggest professional-grade fixes. Return JSON with a "bugs" array of {description, suggestion, explanation, lineNumber}.';

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
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
