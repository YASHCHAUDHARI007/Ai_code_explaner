'use server';

import { groqClient } from '@/lib/groq';

export type AiProjectOverviewOutput = {
  purpose: string;
  functionality: string;
  coreTechnologies: string[];
};

export async function aiProjectOverview(input: { code: string }): Promise<AiProjectOverviewOutput> {
  // Truncate input to keep it fast (~6000 chars)
  const truncatedCode = input.code.slice(0, 6000);

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert software architect. Analyze the code and provide a structured summary. Keep descriptions extremely concise. Return JSON with keys: "purpose", "functionality", "coreTechnologies" (array).',
      },
      {
        role: 'user',
        content: `Code snippet:\n\n${truncatedCode}`,
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
