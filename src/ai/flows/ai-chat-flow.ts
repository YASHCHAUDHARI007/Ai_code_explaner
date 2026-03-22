'use server';

import { groqClient } from '@/lib/groq';

export type ChatOutput = {
  answer: string;
};

/**
 * AI Flow to handle specific questions about a code snippet.
 */
export async function askCodeQuestion(input: { code: string; question: string; language?: string }): Promise<ChatOutput> {
  const truncatedCode = input.code.slice(0, 5000);
  const truncatedQuestion = input.question.slice(0, 500);

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are an expert software engineer. Answer the user\'s question about the provided code snippet accurately and concisely. Use markdown for code blocks.',
      },
      {
        role: 'user',
        content: `Language: ${input.language || 'generic'}\n\nCode Context:\n${truncatedCode}\n\nQuestion: ${truncatedQuestion}`,
      },
    ],
  });

  const answer = response.choices[0]?.message?.content || "I couldn't generate an answer for that question.";
  return { answer };
}
