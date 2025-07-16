import axios from "axios";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProjectGenerationRequest {
  description: string;
  projectType?: string;
  framework?: string;
  styling?: string;
  features?: string[];
}

export interface GeneratedProject {
  name: string;
  description: string;
  files: Record<
    string,
    {
      content: string;
      type: string;
    }
  >;
}

class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!this.apiKey) {
      throw new Error(
        "OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env.local file",
      );
    }
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string> {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4",
          messages,
          max_tokens: 4000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `OpenAI API error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      throw new Error("Failed to call OpenAI API");
    }
  }

  async generateProject(
    request: ProjectGenerationRequest,
  ): Promise<GeneratedProject> {
    const systemPrompt = `You are an expert full-stack developer. Generate a complete, production-ready project based on the user's requirements. 

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "project-name",
  "description": "brief description",
  "files": {
    "filename.ext": {
      "content": "complete file content",
      "type": "file extension"
    }
  }
}

Requirements:
- Use modern React/Next.js with TypeScript
- Include Tailwind CSS for styling
- Use shadcn/ui components where appropriate
- Include proper error handling and loading states
- Make it responsive and accessible
- Include proper imports and exports
- Generate complete, working code (no placeholders or comments like "// TODO")
- Include package.json with all required dependencies
- Use modern ES6+ syntax and React best practices`;

    const userPrompt = `Generate a ${request.projectType || "web application"} project with the following requirements:

Description: ${request.description}
Framework: ${request.framework || "React/Next.js"}
Styling: ${request.styling || "Tailwind CSS"}
Features: ${request.features?.join(", ") || "Standard features"}

Generate a complete project with all necessary files including:
- Component files (.tsx)
- Styling files (.css)
- Configuration files (package.json, etc.)
- Type definitions if needed
- Proper file structure and organization

Make sure all code is complete, functional, and follows modern best practices.`;

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    try {
      const response = await this.callOpenAI(messages);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from OpenAI");
      }

      const projectData = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (
        !projectData.name ||
        !projectData.files ||
        typeof projectData.files !== "object"
      ) {
        throw new Error("Invalid project structure from OpenAI");
      }

      return projectData as GeneratedProject;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }
      throw error;
    }
  }

  async improveCode(code: string, instructions: string): Promise<string> {
    const systemPrompt = `You are an expert developer. Improve the provided code based on the user's instructions. Return only the improved code without explanations or markdown formatting.`;

    const userPrompt = `Please improve this code:

\`\`\`
${code}
\`\`\`

Instructions: ${instructions}

Return only the improved code.`;

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return await this.callOpenAI(messages);
  }

  async fixErrors(code: string, errorMessage: string): Promise<string> {
    const systemPrompt = `You are an expert developer. Fix the errors in the provided code. Return only the corrected code without explanations or markdown formatting.`;

    const userPrompt = `Please fix the errors in this code:

\`\`\`
${code}
\`\`\`

Error: ${errorMessage}

Return only the corrected code.`;

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return await this.callOpenAI(messages);
  }

  async addFeature(
    existingCode: string,
    featureDescription: string,
  ): Promise<string> {
    const systemPrompt = `You are an expert developer. Add the requested feature to the existing code. Return only the updated code without explanations or markdown formatting.`;

    const userPrompt = `Add this feature to the existing code:

Feature: ${featureDescription}

Existing code:
\`\`\`
${existingCode}
\`\`\`

Return only the updated code with the new feature added.`;

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return await this.callOpenAI(messages);
  }
}

export const openAIService = new OpenAIService();
