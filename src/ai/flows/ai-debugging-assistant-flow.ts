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

export async function debugCode(input: { code: string; language: string }): Promise<DebugCodeOutput> {
  // Truncate input to keep it fast
  const truncatedCode = input.code.slice(0, 5000);

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an AI debugging assistant. Find bugs (logic/syntax/security) and suggest fixes. Be brief. Return JSON with a "bugs" array of {description, suggestion, explanation, lineNumber}.',
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
