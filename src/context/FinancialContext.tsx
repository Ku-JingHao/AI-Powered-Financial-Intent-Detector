import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  FinancialIntent,
  FinancialInsight,
  generateInsights
} from '../services/financialIntentService';

interface AnalysisResult {
  financial_intents: {
    detected_intents: Array<{
      description: string;
      urgency_level: string;
      impact: string;
    }>;
    alerts: Array<{
      message: string;
      severity: string;
      impact: string;
      recommendation: string;
    }>;
    suggestions: Array<{
      message: string;
      benefit: string;
      implementation: string;
      priority: string;
    }>;
  };
}

interface AIResult {
  textResponse: string;
}

interface FinancialContextProps {
  intents: FinancialIntent[];
  insights: FinancialInsight[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  addAnalysisResults: (results: AnalysisResult) => void;
  addForecastResult: (intent: any, results: AIResult) => void;
  clearAll: () => void;
  refreshInsights: () => void;
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const [intents, setIntents] = useState<FinancialIntent[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshInsights = useCallback(() => {
    const updatedInsights = generateInsights(intents);
    setInsights(updatedInsights);
  }, [intents]);

  const addAnalysisResults = (results: AnalysisResult) => {
    const now = new Date().toISOString();
    const newInsights: FinancialInsight[] = [];

    // Transform alerts
    results.financial_intents.alerts.forEach((alert, index) => {
      newInsights.push({
        id: `alert-${index}-${now}`,
        title: alert.message,
        description: `Impact: ${alert.impact}\n\nRecommendation: ${alert.recommendation}`,
        category: 'alert',
        priority: alert.severity as 'low' | 'medium' | 'high',
        relatedIntentIds: [],
        timestamp: now
      });
    });

    // Transform suggestions
    results.financial_intents.suggestions.forEach((suggestion, index) => {
      newInsights.push({
        id: `suggestion-${index}-${now}`,
        title: suggestion.message,
        description: `Benefit: ${suggestion.benefit}\n\nImplementation: ${suggestion.implementation}`,
        category: 'suggestion',
        priority: suggestion.priority as 'low' | 'medium' | 'high',
        relatedIntentIds: [],
        timestamp: now
      });
    });

    setInsights(prevInsights => [...prevInsights, ...newInsights]);
  };

  const addForecastResult = (intent: any, results: AIResult) => {
    const now = new Date().toISOString();

    const newInsights: FinancialInsight = {
      id: `forecast-${now}`,
      title: intent.description,
      description: results.textResponse,
      category: 'forecast',
      priority: intent.urgency_level,
      relatedIntentIds: [],
      timestamp: now
    }

    setInsights(prevInsights => [...prevInsights, newInsights]);
  }

  const clearAll = () => {
    setIntents([]);
    setInsights([]);
  };

  const value = {
    intents,
    insights,
    loading,
    setLoading,
    addAnalysisResults,
    addForecastResult,
    clearAll,
    refreshInsights,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextProps => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}; 