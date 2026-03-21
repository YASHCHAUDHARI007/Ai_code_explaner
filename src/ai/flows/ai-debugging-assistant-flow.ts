'use server';
/**
 * @fileOverview An AI debugging assistant that helps identify potential bugs and suggests fixes in code.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugCodeInputSchema = z.object({
  code: z.string().describe('The source code to debug.'),
  language: z.string().describe('The programming language of the source code.'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

const DebugCodeOutputSchema = z.object({
  bugs: z.array(z.object({
    description: z.string().describe('A clear description of the potential bug.'),
    suggestion: z.string().describe('A suggested fix for the identified bug.'),
    explanation: z.string().describe('An explanation of why this is a bug.'),
    lineNumber: z.number().optional().describe('The approximate line number.'),
  })).describe('A list of identified bugs.'),
});
export type DebugCodeOutput = z.infer<typeof DebugCodeOutputSchema>;

export async function debugCode(input: DebugCodeInput): Promise<DebugCodeOutput> {
  return debugCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'debugCodePrompt',
  input: {schema: DebugCodeInputSchema},
  output: {schema: DebugCodeOutputSchema},
  prompt: `You are an expert AI debugging assistant. Your task is to analyze the provided {{{language}}} source code, identify potential bugs, suggest fixes, and provide clear explanations for each.

Focus on common errors, logical flaws, syntax issues, and potential runtime problems. If no obvious bugs are found, return an empty list of bugs.

Code to analyze:
\x60\x60\x60{{{language}}}
{{{code}}}
\x60\x60\x60
`,
});

const debugCodeFlow = ai.defineFlow(
  {
    name: 'aiDebuggingAssistantFlow',
    inputSchema: DebugCodeInputSchema,
    outputSchema: DebugCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);