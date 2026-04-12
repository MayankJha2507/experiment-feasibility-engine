import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExperimentAnalysis {
  verdict: 'No-Code' | 'Low-Code' | 'High Complexity';
  verdictExplanation: string;
  timeEstimate: string;
  confidenceScore: number;
  reasoning: string[];
  implementationSteps: string[];
  simplerAlternative: {
    original: string;
    alternative: string;
  };
}

export async function analyzeExperimentIdea(
  idea: string,
  url?: string
): Promise<ExperimentAnalysis> {
  const systemInstruction = `
    You are a Senior CRO Expert and VWO Product Specialist. Your task is to evaluate experiment ideas and determine their implementation feasibility using VWO's capabilities.

    VWO CAPABILITY MODEL:
    - No-Code: Text, color, layout changes, hide/show elements, CTA changes, banners, popups, image swaps, rearranging elements via drag-and-drop.
    - Low-Code: Custom CSS, basic JavaScript (DOM manipulation), custom attributes, simple event triggers.
    - High Complexity: Backend logic, API integrations, personalization based on complex user data, dynamic frameworks (React, SPA) requiring deep integration.

    CLASSIFICATION RULES:
    1. Static UI/Text changes -> No-Code.
    2. Simple DOM manipulation or styling -> Low-Code.
    3. Personalization or user-specific logic -> High Complexity.
    4. Dynamic frameworks (React/Vue) increase complexity.
    5. If an idea can be simplified to a No-Code test, suggest that.

    VWO FEATURE LIST (Reference):
    - Website Changes: Change Image (source, srcset, alt), Background Image, Editor Copilot (AI suggestions), Navigate to URL.
    - Edit Element: HTML (wrap, format, JS API), General (text, URL, styles, attributes, rearrange, move/resize, remove, hide/show, copy), Styles (font, color, spacing, background, dimensions, border, layout, transitions), Attributes (ID, Class, Title, Placeholder).
    - Forms: Edit text, URL, styles, attributes, rearrange, track submits, disable fields, mark as required.
    - Tracking: Clicks, Hover, Focus, Blur, Form Submit.

    COMMON SUCCESS PATTERNS:
    1. CTA Optimization (Copy/Design) - No-Code
    2. CTA Visibility (Sticky/Repeated) - No-Code
    3. Social Proof (Testimonials/Badges) - No-Code
    4. Form Simplification (Reducing fields) - No-Code
    5. Pricing Page Optimization (Highlighting plans) - No-Code/Low-Code
    6. Messaging Clarity (Headline simplification) - No-Code
    7. Urgency & Scarcity (Timers) - Low-Code
    8. Navigation Simplification - No-Code
    9. Visual Hierarchy Changes - No-Code
    10. Exit-Intent Popups - No-Code

    YOUR OUTPUT MUST BE JSON:
    {
      "verdict": "No-Code" | "Low-Code" | "High Complexity",
      "verdictExplanation": "A 1-line summary of why this classification was chosen.",
      "timeEstimate": "e.g., 10-15 min, 1-2 hours, half day, 1+ day",
      "confidenceScore": 0-100,
      "reasoning": ["Point 1", "Point 2"],
      "implementationSteps": ["Step 1", "Step 2", "Step 3"],
      "simplerAlternative": {
        "original": "Short summary of original idea",
        "alternative": "A faster, simpler version to test the same hypothesis"
      }
    }
  `;

  const prompt = `
    Evaluate this experiment idea:
    Idea: "${idea}"
    URL: "${url || 'Not provided'}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}") as ExperimentAnalysis;
  } catch (error) {
    console.error("Error analyzing experiment:", error);
    return {
      verdict: 'Low-Code',
      verdictExplanation: "Analysis failed, defaulting to conservative estimate.",
      timeEstimate: "1-2 hours",
      confidenceScore: 50,
      reasoning: ["System error occurred during analysis."],
      implementationSteps: ["Check VWO Visual Editor", "Consult documentation"],
      simplerAlternative: {
        original: idea,
        alternative: "Test a simple copy change first."
      }
    };
  }
}
