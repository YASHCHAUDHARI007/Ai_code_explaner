import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY || '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'.trim(),
    }),
  ],
  model: 'groq/llama-3.1-8b-instant',
});