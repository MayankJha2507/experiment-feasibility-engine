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
  try {
    const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idea, url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing experiment via Netlify function:", error);
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
