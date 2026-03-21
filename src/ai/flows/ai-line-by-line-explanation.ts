'use server';
/**
 * @fileOverview A Genkit flow for explaining code snippets line by line.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
  language: z.string().optional().describe('The programming language of the code snippet.'),
});
export type CodeExplanationInput = z.infer<typeof CodeExplanationInputSchema>;

const CodeExplanationOutputSchema = z.object({
  explanations: z.array(z.object({
    line: z.string().describe('A single line of the code snippet.'),
    explanation: z.string().describe('A clear, concise explanation.'),
  })).describe('Line by line explanations.'),
});
export type CodeExplanationOutput = z.infer<typeof CodeExplanationOutputSchema>;

export async function explainCodeLineByLine(input: CodeExplanationInput): Promise<CodeExplanationOutput> {
  return aiLineByLineExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLineByLineExplanationPrompt',
  input: {schema: CodeExplanationInputSchema},
  output: {schema: CodeExplanationOutputSchema},
  prompt: `You are an expert programmer. Explain the provided code snippet line by line in simple language.

Code (Language: {{{language}}}):
\x60\x60\x60
{{{code}}}
\x60\x60\x60

Each line of the original code must have a corresponding explanation in the output.`,
});

const aiLineByLineExplanationFlow = ai.defineFlow(
  {
    name: 'aiLineByLineExplanationFlow',
    inputSchema: CodeExplanationInputSchema,
    outputSchema: CodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);