'use server';

import { groqClient } from '@/lib/groq';

export type AiProjectOverviewOutput = {
  overview: string;
};

export async function aiProjectOverview(input: { code: string }): Promise<AiProjectOverviewOutput> {
  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert software architect. Provide a concise, high-level summary of the provided codebase. Focus on its purpose, functionality, and core technologies. Return your response as a JSON object with a single key "overview".',
      },
      {
        role: 'user',
        content: `Codebase:\n\n${input.code}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"overview": "No response generated."}';
  try {
    return JSON.parse(content) as AiProjectOverviewOutput;
  } catch (e) {
    return { overview: content };
  }
}