'use server';
/**
 * @fileOverview A Genkit flow for explaining code snippets line by line.
 *
 * - explainCodeLineByLine - A function that handles the line-by-line code explanation process.
 * - CodeExplanationInput - The input type for the explainCodeLineByLine function.
 * - CodeExplanationOutput - The return type for the explainCodeLineByLine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
  language: z
    .string()
    .optional()
    .describe(
      'The programming language of the code snippet (e.g., Python, JavaScript, Java). If not provided, the model will try to infer it.'
    ),
});
export type CodeExplanationInput = z.infer<typeof CodeExplanationInputSchema>;

const CodeExplanationOutputSchema = z.object({
  explanations: z
    .array(
      z.object({
        line: z.string().describe('A single line of the code snippet.'),
        explanation: z
          .string()
          .describe('A clear, concise explanation of what this line of code does.'),
      })
    )
    .describe(
      'An array of objects, each containing a line of code and its explanation.'
    ),
});
export type CodeExplanationOutput = z.infer<
  typeof CodeExplanationOutputSchema
>;

export async function explainCodeLineByLine(
  input: CodeExplanationInput
): Promise<CodeExplanationOutput> {
  return aiLineByLineExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiLineByLineExplanationPrompt',
  input: {schema: CodeExplanationInputSchema},
  output: {schema: CodeExplanationOutputSchema},
  prompt: `You are an expert programmer and code explainer. Your task is to explain the provided code snippet line by line in simple, easy-to-understand language.

If the programming language is provided, use that context. Otherwise, try to infer the language.

Code (Language: {{{language}}})

\`\`\`
{{{code}}}
\`\`\`

Provide the explanation in the specified JSON format. Each line of the original code should have a corresponding explanation.`,
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