'use server';

import { groqClient } from '@/lib/groq';

export type AiProjectOverviewOutput = {
  projectType: string;
  entryPoint: string;
  purpose: string;
  functionality: string;
  workingFlow: string;
  importantFiles: string[];
  coreTechnologies: string[];
};

/**
 * AI Flow to perform deep architectural analysis of a codebase.
 */
export async function aiProjectOverview(input: { code: string; mode?: 'beginner' | 'developer'; model?: string }): Promise<AiProjectOverviewOutput> {
  const truncatedCode = input.code.slice(0, 8000);
  const mode = input.mode || 'developer';

  // Use user selected model or fallback to intelligent auto-selection
  const model = (input.model && input.model !== 'auto')
    ? input.model
    : truncatedCode.length > 3000 ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

  const systemPrompt = mode === 'beginner' 
    ? `You are a friendly technical architect explaining a project to a beginner. 
       Analyze the provided files and folder structure to determine:
       1. Project Type (e.g., React App, Python API).
       2. Entry Point (where the execution starts).
       3. Purpose and functionality in simple terms.
       4. Working Flow: Explain how data or control moves through the app like a story.
       5. Identify the most important files.
       Return valid JSON with keys: "projectType", "entryPoint", "purpose", "functionality", "workingFlow", "importantFiles" (array), "coreTechnologies" (array).`
    : `You are an expert software architect performing a deep codebase scan.
       Analyze the provided files, dependency manifests, and directory structure to identify:
       1. Project Type/Framework (e.g., Next.js, FastAPI, Spring Boot).
       2. Primary Entry Point (the main file or bootstrap logic).
       3. Architectural Purpose and Functionality.
       4. Working Flow: A technical breakdown of the request/data lifecycle or execution path.
       5. Important Files: List critical configuration, routing, and core logic files.
       Return valid JSON with keys: "projectType", "entryPoint", "purpose", "functionality", "workingFlow", "importantFiles", "coreTechnologies".`;

  const response = await groqClient.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Codebase Context for Analysis:\n\n${truncatedCode}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return {
      projectType: parsed.projectType || "Unknown",
      entryPoint: parsed.entryPoint || "Undetected",
      purpose: parsed.purpose || "Analysis pending",
      functionality: parsed.functionality || "Analysis pending",
      workingFlow: parsed.workingFlow || "Workflow mapping in progress",
      importantFiles: Array.isArray(parsed.importantFiles) ? parsed.importantFiles : [],
      coreTechnologies: Array.isArray(parsed.coreTechnologies) ? parsed.coreTechnologies : [],
    };
  } catch (e) {
    return {
      projectType: "Error",
      entryPoint: "Error",
      purpose: "Analysis failed",
      functionality: "Could not determine functionality",
      workingFlow: "Error during mapping",
      importantFiles: [],
      coreTechnologies: [],
    };
  }
}
