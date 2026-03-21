
'use server';

import { groqClient } from '@/lib/groq';

export type CodeExplanationOutput = {
  explanations: Array<{
    line: string;
    explanation: string;
  }>;
};

export async function explainCodeLineByLine(input: { code: string; language?: string }): Promise<CodeExplanationOutput> {
  // Truncate input to maintain speed
  const truncatedCode = input.code.slice(0, 4000);

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Explain the provided code line by line. Be short and simple. Return JSON with an "explanations" array of {line, explanation} objects.',
      },
      {
        role: 'user',
        content: `Language: ${input.language || 'generic'}\n\nCode:\n\n${truncatedCode}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"explanations": []}';
  try {
    return JSON.parse(content) as CodeExplanationOutput;
  } catch (e) {
    return { explanations: [] };
  }
}
