'use server';
/**
 * @fileOverview A Genkit flow for generating a high-level overview of a codebase.
 *
 * - aiProjectOverview - A function that generates a codebase overview.
 * - AiProjectOverviewInput - The input type for the aiProjectOverview function.
 * - AiProjectOverviewOutput - The return type for the aiProjectOverview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiProjectOverviewInputSchema = z.object({
  code: z.string().describe('The entire codebase or a significant portion of it, provided as a single string, or a description of the project structure and key files.'),
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
  prompt: `You are an expert software architect. Your task is to provide a concise, high-level summary of the provided codebase. Focus on its overall purpose, main functionalities, and core technologies used.

Codebase:
{{{code}}}`,
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