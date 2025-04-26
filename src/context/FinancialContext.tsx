import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  FinancialIntent, 
  FinancialInsight, 
  analyzeFinancialIntent, 
  generateInsights 
} from '../services/financialIntentService';
import { seedIntents, seedInsights } from '../services/seedData';

interface FinancialContextProps {
  intents: FinancialIntent[];
  insights: FinancialInsight[];
  loading: boolean;
  addIntent: (text: string) => Promise<void>;
  clearAll: () => void;
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const [intents, setIntents] = useState<FinancialIntent[]>(seedIntents);
  const [insights, setInsights] = useState<FinancialInsight[]>(seedInsights);
  const [loading, setLoading] = useState<boolean>(false);

  const addIntent = async (text: string) => {
    setLoading(true);
    try {
      const newIntent = await analyzeFinancialIntent(text);
      
      // Update the intents array
      const updatedIntents = [...intents, newIntent];
      setIntents(updatedIntents);
      
      // Generate new insights based on all intents
      const updatedInsights = generateInsights(updatedIntents);
      setInsights(updatedInsights);
    } catch (error) {
      console.error('Error analyzing financial intent:', error);
    } finally {
      setLoading(false);
    }
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
    clearAll,
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