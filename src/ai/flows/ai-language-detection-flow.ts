
'use server';

import { groqClient } from '@/lib/groq';

export type LanguageDetectionOutput = {
  language: string;
  confidence: number;
};

export async function detectLanguage(input: { code: string }): Promise<LanguageDetectionOutput> {
  const truncatedCode = input.code.slice(0, 2000);

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'Identify the programming language of the provided code. Return JSON with "language" (lowercase string like "typescript", "python", etc.) and "confidence" (0-1 number).',
      },
      {
        role: 'user',
        content: `Code snippet:\n\n${truncatedCode}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{"language": "typescript", "confidence": 0}';
  try {
    const parsed = JSON.parse(content);
    return {
      language: parsed.language || "typescript",
      confidence: parsed.confidence || 0.5,
    };
  } catch (e) {
    return { language: "typescript", confidence: 0 };
  }
}
