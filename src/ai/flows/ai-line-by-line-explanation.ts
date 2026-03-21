'use server';

import { groqClient } from '@/lib/groq';

export type CodeExplanationOutput = {
  explanations: Array<{
    line: string;
    explanation: string;
  }>;
};

export async function explainCodeLineByLine(input: { code: string; language?: string }): Promise<CodeExplanationOutput> {
  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert programmer. Explain the provided code snippet line by line in simple language. Return your response as a JSON object with an "explanations" array containing objects with "line" and "explanation" keys.',
      },
      {
        role: 'user',
        content: `Code (Language: ${input.language || 'unknown'}):\n\n${input.code}`,
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