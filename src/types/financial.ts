export interface FinancialInsight {
  id: string;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  // ... existing code ...
} 