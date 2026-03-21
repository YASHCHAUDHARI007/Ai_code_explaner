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
  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert AI debugging assistant. Analyze the provided source code, identify potential bugs, suggest fixes, and provide clear explanations. Return your response as a JSON object with a "bugs" array.',
      },
      {
        role: 'user',
        content: `Language: ${input.language}\n\nCode:\n\n${input.code}`,
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