const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

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

class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    console.log(
      "Gemini API Key loaded:",
      this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "NOT FOUND",
    );

    if (this.apiKey && !this.apiKey.startsWith("AIza")) {
      console.warn(
        '⚠️ Gemini API key should start with "AIza". Current key:',
        this.apiKey.substring(0, 10) + "...",
      );
    }
  }

  private checkApiKey() {
    if (!this.apiKey) {
      throw new Error(
        "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env.local file",
      );
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    this.checkApiKey();
    try {
      const apiUrl = `${GEMINI_API_URL}?key=${this.apiKey}`;
      console.log("Making Gemini API request to:", GEMINI_API_URL);
      console.log(
        "API Key (first 10 chars):",
        this.apiKey.substring(0, 10) + "...",
      );

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      });

      if (!response.ok) {
        let errorData = {};
        let errorText = "";

        try {
          errorData = await response.json();
        } catch {
          errorText = await response.text().catch(() => "No response body");
        }

        console.error("Gemini API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText,
          url: response.url,
        });

        // Extract error message from various possible structures
        let errorMessage = "";
        if (errorData && typeof errorData === "object") {
          if (typeof (errorData as any).error?.message === "string") {
            errorMessage = (errorData as any).error.message;
          } else if (typeof (errorData as any).message === "string") {
            errorMessage = (errorData as any).message;
          } else if ((errorData as any).error) {
            errorMessage = JSON.stringify((errorData as any).error);
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } else if (errorText) {
          errorMessage = errorText;
        } else {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }

        throw new Error(
          `Gemini API error (${response.status}): ${errorMessage}`,
        );
      }

      const data = await response.json();
      console.log("Gemini API Response:", data);

      if (!data.candidates || !data.candidates[0]) {
        console.error("No candidates in response:", data);
        throw new Error("No response candidates from Gemini API");
      }

      if (
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0]
      ) {
        console.error("Invalid content structure:", data.candidates[0]);
        throw new Error("Invalid content structure from Gemini API");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API Call Error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `🌐 Network Error\n\nFailed to connect to Gemini API. Please check your internet connection and try again.\n\nError: ${error.message}`,
        );
      }

      if (error instanceof Error) {
        // Handle specific Gemini API errors
        if (
          error.message.includes("API_KEY_INVALID") ||
          error.message.includes("invalid")
        ) {
          throw new Error(
            `🔑 Invalid Gemini API Key\n\nYour Gemini API key appears to be invalid. To fix this:\n\n1. Get a new API key at: https://makersuite.google.com/app/apikey\n2. Update your .env.local file: VITE_GEMINI_API_KEY=your-new-key\n3. Restart the development server\n\nError: ${error.message}`,
          );
        }

        if (
          error.message.includes("RATE_LIMIT_EXCEEDED") ||
          error.message.includes("rate limit")
        ) {
          throw new Error(
            `⏰ Rate Limit Exceeded\n\nYou're making requests too quickly. Please wait a moment and try again.\n\nError: ${error.message}`,
          );
        }

        if (
          error.message.includes("quota") ||
          error.message.includes("QUOTA")
        ) {
          throw new Error(
            `🚫 Gemini Quota Exceeded\n\nYour API key has hit the usage limit. To fix this:\n\n1. Check your Google AI Studio usage at: https://makersuite.google.com/app/apikey\n2. Upgrade your plan if needed\n3. Or get a new API key\n4. Update your .env.local file with the new key\n5. Restart the development server\n\nError: ${error.message}`,
          );
        }

        // Pass through the original error if we already improved it
        if (error.message.includes("Gemini API error:")) {
          throw error;
        }

        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error("Failed to call Gemini API");
    }
  }

  async generateProject(
    request: ProjectGenerationRequest,
  ): Promise<GeneratedProject> {
    const prompt = `You are an expert full-stack developer. Generate a complete, production-ready project based on the user's requirements.

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
- Use modern ES6+ syntax and React best practices

Generate a ${request.projectType || "web application"} project with the following requirements:

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

Make sure all code is complete, functional, and follows modern best practices.

Return ONLY the JSON object, no additional text or formatting.`;

    try {
      const response = await this.callGemini(prompt);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from Gemini API");
      }

      const projectData = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (
        !projectData.name ||
        !projectData.files ||
        typeof projectData.files !== "object"
      ) {
        throw new Error("Invalid project structure from Gemini API");
      }

      return projectData as GeneratedProject;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Failed to parse Gemini response as JSON");
      }
      throw error;
    }
  }

  async improveCode(code: string, instructions: string): Promise<string> {
    const prompt = `You are an expert developer. Improve the provided code based on the user's instructions. Return only the improved code without explanations or markdown formatting.

Please improve this code:

\`\`\`
${code}
\`\`\`

Instructions: ${instructions}

Return only the improved code.`;

    return await this.callGemini(prompt);
  }

  async fixErrors(code: string, errorMessage: string): Promise<string> {
    const prompt = `You are an expert developer. Fix the errors in the provided code. Return only the corrected code without explanations or markdown formatting.

Please fix the errors in this code:

\`\`\`
${code}
\`\`\`

Error: ${errorMessage}

Return only the corrected code.`;

    return await this.callGemini(prompt);
  }

  async addFeature(
    existingCode: string,
    featureDescription: string,
  ): Promise<string> {
    const prompt = `You are an expert developer. Add the requested feature to the existing code. Return only the updated code without explanations or markdown formatting.

Add this feature to the existing code:

Feature: ${featureDescription}

Existing code:
\`\`\`
${existingCode}
\`\`\`

Return only the updated code with the new feature added.`;

    return await this.callGemini(prompt);
  }
}

export const geminiService = new GeminiService();
