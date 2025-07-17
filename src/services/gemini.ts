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
    // Use the provided static API key
    this.apiKey = "AIzaSyANdISWIVOmI6IP517D8lJNJWtIJOeVO3U";
    console.log(
      "Gemini API Key loaded:",
      this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "NOT FOUND",
    );
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
    const prompt = `Create a complete web project based on the following description: ${request.description}.

Respond with a JSON array of file objects. Each object must contain:
- 'path': string (full relative file path including folders)
- 'content': string (full source code for that file)

Only return JSON. Do not include markdown formatting, extra explanation, or plain text — only a valid JSON array of file objects.

Requirements:
- Use modern React/Next.js with TypeScript if applicable
- Include Tailwind CSS for styling when appropriate
- Include proper error handling and loading states
- Make it responsive and accessible
- Include proper imports and exports
- Generate complete, working code (no placeholders or comments like "// TODO")
- Include package.json with all required dependencies when building React/Node projects
- Use modern ES6+ syntax and best practices

Project Type: ${request.projectType || "web application"}
Framework: ${request.framework || "HTML/CSS/JS"}
Styling: ${request.styling || "CSS"}
Features: ${request.features?.join(", ") || "Standard features"}`;

    try {
      const response = await this.callGemini(prompt);

      // Parse the JSON response - look for JSON array
      let jsonData;

      // Try to find JSON array in the response
      const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        jsonData = JSON.parse(jsonArrayMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        jsonData = JSON.parse(response);
      }

      // Validate that we got an array
      if (!Array.isArray(jsonData)) {
        throw new Error("Expected JSON array of file objects");
      }

      // Convert the new format to the old format for compatibility
      const files: Record<string, { content: string; type: string }> = {};

      jsonData.forEach((fileObj: any) => {
        if (fileObj.path && fileObj.content) {
          const extension = fileObj.path.split(".").pop() || "txt";
          files[fileObj.path] = {
            content: fileObj.content,
            type: extension,
          };
        }
      });

      // Generate a project name from the description
      const projectName =
        request.description
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 50) || "generated-project";

      const projectData: GeneratedProject = {
        name: projectName,
        description: request.description,
        files: files,
      };

      return projectData;
    } catch (error) {
      console.error("Gemini parsing error:", error);
      if (error instanceof SyntaxError) {
        throw new Error(
          "Failed to parse Gemini response as JSON. Please try again.",
        );
      }
      throw error;
    }
  }

  async improveCode(code: string, instructions: string): Promise<string> {
    const prompt = `Improve the provided code based on the instructions. Return only the improved code without explanations or markdown formatting.

Code to improve:
${code}

Instructions: ${instructions}

Return only the improved code.`;

    return await this.callGemini(prompt);
  }

  async fixErrors(code: string, errorMessage: string): Promise<string> {
    const prompt = `Fix the errors in the provided code. Return only the corrected code without explanations or markdown formatting.

Code with errors:
${code}

Error: ${errorMessage}

Return only the corrected code.`;

    return await this.callGemini(prompt);
  }

  async addFeature(
    existingCode: string,
    featureDescription: string,
  ): Promise<string> {
    const prompt = `Add the requested feature to the existing code. Return only the updated code without explanations or markdown formatting.

Feature to add: ${featureDescription}

Existing code:
${existingCode}

Return only the updated code with the new feature added.`;

    return await this.callGemini(prompt);
  }
}

export const geminiService = new GeminiService();
