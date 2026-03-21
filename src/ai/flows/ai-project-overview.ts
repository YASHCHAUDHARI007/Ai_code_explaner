'use server';
/**
 * @fileOverview A Genkit flow for generating a high-level overview of a codebase.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiProjectOverviewInputSchema = z.object({
  code: z.string().describe('The entire codebase or a significant portion of it.'),
});
export type AiProjectOverviewInput = z.infer<typeof AiProjectOverviewInputSchema>;

const AiProjectOverviewOutputSchema = z.object({
  overview: z.string().describe('A concise, high-level summary of the codebase\'s purpose and functionality.'),
});
export type AiProjectOverviewOutput = z.infer<typeof AiProjectOverviewOutputSchema>;

export async function aiProjectOverview(input: AiProjectOverviewInput): Promise<AiProjectOverviewOutput> {
  return aiProjectOverviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProjectOverviewPrompt',
  input: { schema: AiProjectOverviewInputSchema },
  output: { schema: AiProjectOverviewOutputSchema },
  prompt: `You are an expert software architect. Provide a concise, high-level summary of the provided codebase. Focus on its purpose, functionality, and core technologies.

Codebase:
\x60\x60\x60
{{{code}}}
\x60\x60\x60`,
});

const aiProjectOverviewFlow = ai.defineFlow(
  {
    name: 'aiProjectOverviewFlow',
    inputSchema: AiProjectOverviewInputSchema,
    outputSchema: AiProjectOverviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);