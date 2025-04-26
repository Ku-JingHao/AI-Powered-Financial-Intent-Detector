import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  FinancialIntent,
  FinancialInsight,
  analyzeFinancialIntent,
  generateInsights
} from '../services/financialIntentService';

interface AnalysisResult {
  financial_intents: {
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

interface FinancialContextProps {
  intents: FinancialIntent[];
  insights: FinancialInsight[];
  loading: boolean;
  addIntent: (text: string) => Promise<void>;
  addAnalysisResults: (results: AnalysisResult) => void;
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

  const addIntent = async (text: string) => {
    setLoading(true);
    try {
      const newIntent = await analyzeFinancialIntent(text);
      setIntents(prevIntents => [...prevIntents, newIntent]);
    } catch (error) {
      console.error('Error analyzing financial intent:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const clearAll = () => {
    setIntents([]);
    setInsights([]);
  };

  const value = {
    intents,
    insights,
    loading,
    addIntent,
    addAnalysisResults,
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