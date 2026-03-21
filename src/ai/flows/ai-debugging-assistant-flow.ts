'use server';
/**
 * @fileOverview An AI debugging assistant that helps identify potential bugs and suggests fixes in code.
 *
 * - debugCode - A function that handles the code debugging process.
 * - DebugCodeInput - The input type for the debugCode function.
 * - DebugCodeOutput - The return type for the debugCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugCodeInputSchema = z.object({
  code: z.string().describe('The source code to debug.'),
  language: z.string().describe('The programming language of the source code (e.g., Python, Java, JavaScript, C++, C, TypeScript).'),
});
export type DebugCodeInput = z.infer<typeof DebugCodeInputSchema>;

const DebugCodeOutputSchema = z.object({
  bugs: z.array(z.object({
    description: z.string().describe('A clear description of the potential bug.'),
    suggestion: z.string().describe('A suggested fix for the identified bug.'),
    explanation: z.string().describe('An explanation of why this is a bug and how the suggested fix addresses it.'),
    lineNumber: z.number().optional().describe('The approximate line number where the bug is located, if applicable.'),
  })).describe('A list of identified bugs and their suggested fixes.'),
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

Focus on common errors, logical flaws, syntax issues, and potential runtime problems. If no obvious bugs are found, state that the code appears to be clean.

Provide your analysis in the specified JSON format.

Code to analyze:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
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