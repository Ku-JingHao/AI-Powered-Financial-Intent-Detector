interface SentimentAnalysisResult {
  financial_intents: {
    detected_intents: Array<{
      description: string;
      urgency_level: string;
      urgency_score: number;
      timeline: string;
      impact: string;
    }>;
    confidence_score: number;
    relevant_details: string;
    financial_topics: string[];
    action_items: string[];
    expenditures: Array<{
      type: string;
      amount: string;
      timeline: string;
      description: string;
    }>;
    revenue_actions: string[];
    alerts: string[];
    suggestions: string[];
  };
  summary: {
    total_intents: number;
    high_urgency_intents: number;
    total_alerts: number;
    total_suggestions: number;
    overall_urgency: string;
  };
}

export const analyzeText = async (text: string): Promise<SentimentAnalysisResult> => {
  try {
    console.log('Sending text for analysis:', text);
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to analyze text: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received analysis results:', data);
    
    // Validate the response structure
    if (!data.financial_intents || !data.summary) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from sentiment analysis');
    }

    return data;
  } catch (error) {
    console.error('Error in analyzeText:', error);
    throw error;
  }
}; 