
'use server';

import { groqClient } from '@/lib/groq';

export type AiProjectOverviewOutput = {
  purpose: string;
  functionality: string;
  coreTechnologies: string[];
};

export async function aiProjectOverview(input: { code: string; mode?: 'beginner' | 'developer' }): Promise<AiProjectOverviewOutput> {
  const truncatedCode = input.code.slice(0, 6000);
  const mode = input.mode || 'developer';

  const systemPrompt = mode === 'beginner' 
    ? 'You are a friendly teacher. Analyze the code and provide a structured summary using simple terms and analogies. Avoid heavy jargon. Return JSON with keys: "purpose", "functionality", "coreTechnologies" (array of strings).'
    : 'You are an expert software architect. Analyze the code and provide a structured summary focusing on design patterns, architectural decisions, and system flow. Return JSON with keys: "purpose", "functionality", "coreTechnologies" (array of strings).';

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Code snippet for analysis:\n\n${truncatedCode}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      purpose: parsed.purpose || "Analysis pending",
      functionality: parsed.functionality || "Analysis pending",
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
