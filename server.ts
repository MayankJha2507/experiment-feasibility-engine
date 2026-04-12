import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  // Simulate Netlify Function endpoint
  app.post("/.netlify/functions/analyze", async (req, res) => {
    try {
      const { idea, url } = req.body;

      if (!idea) {
        return res.status(400).json({ error: 'Experiment idea is required' });
      }

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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: 'Failed to analyze experiment' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
