'use server';

import { groqClient } from '@/lib/groq';

export type AiProjectOverviewOutput = {
  purpose: string;
  functionality: string;
  coreTechnologies: string[];
};

export async function aiProjectOverview(input: { code: string }): Promise<AiProjectOverviewOutput> {
  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert software architect. Analyze the provided codebase and provide a structured summary. Return your response as a JSON object with exactly three keys: "purpose" (string), "functionality" (string), and "coreTechnologies" (an array of strings).',
      },
      {
        role: 'user',
        content: `Codebase:\n\n${input.code}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      purpose: parsed.purpose || "Not specified",
      functionality: parsed.functionality || "Not specified",
      coreTechnologies: Array.isArray(parsed.coreTechnologies) ? parsed.coreTechnologies : [],
    };
  } catch (e) {
    return {
      purpose: "Analysis failed",
      functionality: "Could not determine functionality",
      coreTechnologies: [],
    };
  }
}
