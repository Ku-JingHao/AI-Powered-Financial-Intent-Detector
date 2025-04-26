// This is a mock service that would be replaced with actual NLP processing

export interface FinancialIntent {
  id: string;
  text: string;
  timestamp: string;
  intents: {
    type: IntentType;
    confidence: number;
    details?: string;
  }[];
  sentiment: {
    score: number; // -1 to 1, where -1 is very negative, 1 is very positive
    label: 'negative' | 'neutral' | 'positive';
  };
}

export type IntentType = 
  | 'cash_flow_concern' 
  | 'expense_reduction' 
  | 'investment_opportunity' 
  | 'revenue_growth' 
  | 'budget_planning'
  | 'tax_consideration'
  | 'debt_management';

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'alert' | 'suggestion' | 'forecast';
  priority: 'low' | 'medium' | 'high';
  relatedIntentIds: string[];
  timestamp: string;
}

// Mock function to analyze financial intent
export const analyzeFinancialIntent = async (text: string): Promise<FinancialIntent> => {
  // In a real application, this would call an NLP service
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Create a mock intent analysis
      const mockIntent: FinancialIntent = {
        id: Math.random().toString(36).substring(2, 10),
        text,
        timestamp: new Date().toISOString(),
        intents: detectMockIntents(text),
        sentiment: analyzeMockSentiment(text),
      };
      
      resolve(mockIntent);
    }, 1000);
  });
};

export const generateInsights = (intents: FinancialIntent[]): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const now = new Date().toISOString();

  // Generate cash flow insights
  const cashFlowIntents = intents.filter(i => 
    i.intents.some(intent => intent.type === 'cash_flow_concern')
  );
  if (cashFlowIntents.length > 0) {
    insights.push({
      id: Math.random().toString(36).substring(2, 10),
      title: 'Cash Flow Concerns Detected',
      description: `Multiple communications indicate concerns about cash flow. Consider reviewing your current cash position and upcoming obligations.`,
      category: 'alert',
      priority: 'high',
      relatedIntentIds: cashFlowIntents.map(i => i.id),
      timestamp: now
    });
  }

  // Generate expense insights
  const expenseIntents = intents.filter(i => 
    i.intents.some(intent => intent.type === 'expense_reduction')
  );
  if (expenseIntents.length > 0) {
    insights.push({
      id: Math.random().toString(36).substring(2, 10),
      title: 'Expense Reduction Opportunities',
      description: `Several communications suggest potential areas for expense reduction. Review your current expenses and identify optimization opportunities.`,
      category: 'suggestion',
      priority: 'medium',
      relatedIntentIds: expenseIntents.map(i => i.id),
      timestamp: now
    });
  }
  
  // Add more insights based on other intent types
  
  return insights;
};

// Helper functions for mock analysis

const detectMockIntents = (text: string) => {
  const intents = [];
  const lowerText = text.toLowerCase();
  
  // Cash flow detection
  if (lowerText.includes('cash flow') || lowerText.includes('cashflow') || lowerText.includes('liquidity')) {
    intents.push({
      type: 'cash_flow_concern' as IntentType,
      confidence: 0.85,
      details: 'Detected concern about business liquidity',
    });
  }
  
  // Expense reduction
  if (lowerText.includes('cut costs') || lowerText.includes('reduce expenses') || lowerText.includes('spending less')) {
    intents.push({
      type: 'expense_reduction' as IntentType,
      confidence: 0.92,
      details: 'Interest in reducing business expenses',
    });
  }
  
  // Revenue growth
  if (lowerText.includes('increase sales') || lowerText.includes('more revenue') || lowerText.includes('boost income')) {
    intents.push({
      type: 'revenue_growth' as IntentType,
      confidence: 0.78,
      details: 'Focus on growing business income',
    });
  }
  
  // Budget planning
  if (lowerText.includes('budget') || lowerText.includes('financial plan') || lowerText.includes('forecast')) {
    intents.push({
      type: 'budget_planning' as IntentType,
      confidence: 0.88,
      details: 'Interest in budget planning or forecasting',
    });
  }
  
  // If no intents detected, add a fallback with low confidence
  if (intents.length === 0) {
    intents.push({
      type: 'budget_planning' as IntentType,
      confidence: 0.35,
      details: 'Low confidence detection of financial planning interest',
    });
  }
  
  return intents;
};

const analyzeMockSentiment = (text: string): { score: number; label: 'negative' | 'neutral' | 'positive' } => {
  const lowerText = text.toLowerCase();
  
  // Very simple sentiment analysis
  const negativeTerms = ['worried', 'concerned', 'problem', 'issue', 'trouble', 'difficult', 'bad', 'decrease', 'loss'];
  const positiveTerms = ['opportunity', 'increase', 'growth', 'improve', 'good', 'great', 'excellent', 'profit', 'success'];
  
  let sentiment = 0;
  
  // Count negative terms
  negativeTerms.forEach(term => {
    if (lowerText.includes(term)) sentiment -= 0.2;
  });
  
  // Count positive terms
  positiveTerms.forEach(term => {
    if (lowerText.includes(term)) sentiment += 0.2;
  });
  
  // Clamp between -1 and 1
  sentiment = Math.max(-1, Math.min(1, sentiment));
  
  let label: 'negative' | 'neutral' | 'positive';
  if (sentiment < -0.2) {
    label = 'negative';
  } else if (sentiment > 0.2) {
    label = 'positive';
  } else {
    label = 'neutral';
  }
  
  return {
    score: sentiment,
    label
  };
}; 