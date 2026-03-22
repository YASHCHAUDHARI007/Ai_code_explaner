
'use server';

import { groqClient } from '@/lib/groq';

export type CodeExplanationOutput = {
  explanations: Array<{
    line: string;
    explanation: string;
  }>;
};

export async function explainCodeLineByLine(input: { code: string; language?: string; mode?: 'beginner' | 'developer' }): Promise<CodeExplanationOutput> {
  const truncatedCode = input.code.slice(0, 4000);
  const mode = input.mode || 'developer';

  const systemPrompt = mode === 'beginner'
    ? 'Explain the provided code line by line for a beginner. Use simple language and analogies. Avoid technical jargon where possible. Return JSON with an "explanations" array of {line, explanation} objects.'
    : 'Explain the provided code line by line for a senior developer. Be concise, technical, and focus on logic flow, performance, or specific language features. Return JSON with an "explanations" array of {line, explanation} objects.';

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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
