import React, { useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Button,
  Chip
} from '@mui/material';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link as RouterLink } from 'react-router-dom';

import InfoCard from '../common/InfoCard';
import BarChart from '../common/BarChart';
import { useFinancial } from '../../context/FinancialContext';
import { IntentType } from '../../services/financialIntentService';

const Dashboard: React.FC = () => {
  const { intents, insights, loading } = useFinancial();

  // Generate summary data for the dashboard
  const summaryData = useMemo(() => {
    // Get all detected intent types
    const allIntentTypes = intents.flatMap(intent => 
      intent.intents.map(i => i.type)
    );
    
    // Count occurrences of each intent type
    const intentCounts: Record<IntentType, number> = {
      cash_flow_concern: 0,
      expense_reduction: 0,
      investment_opportunity: 0,
      revenue_growth: 0,
      budget_planning: 0,
      tax_consideration: 0,
      debt_management: 0
    };
    
    allIntentTypes.forEach(type => {
      if (type in intentCounts) {
        intentCounts[type]++;
      }
    });
    
    // Get sentiment counts
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    intents.forEach(intent => {
      sentimentCounts[intent.sentiment.label]++;
    });
    
    return {
      intentCounts,
      sentimentCounts,
      totalIntents: intents.length,
      totalInsights: insights.length,
      highPriorityInsights: insights.filter(i => i.priority === 'high').length
    };
  }, [intents, insights]);

  // Chart data for intents distribution
  const intentsChartData = useMemo(() => {
    return {
      labels: [
        'Cash Flow', 
        'Expenses', 
        'Investment', 
        'Revenue', 
        'Budget',
        'Tax',
        'Debt'
      ],
      datasets: [
        {
          label: 'Detected Intents',
          data: [
            summaryData.intentCounts.cash_flow_concern,
            summaryData.intentCounts.expense_reduction,
            summaryData.intentCounts.investment_opportunity,
            summaryData.intentCounts.revenue_growth,
            summaryData.intentCounts.budget_planning,
            summaryData.intentCounts.tax_consideration,
            summaryData.intentCounts.debt_management
          ],
          backgroundColor: '#2196f3',
        },
      ],
    };
  }, [summaryData.intentCounts]);

  // Chart data for sentiment distribution
  const sentimentChartData = useMemo(() => {
    return {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [
        {
          label: 'Communication Sentiment',
          data: [
            summaryData.sentimentCounts.positive,
            summaryData.sentimentCounts.neutral,
            summaryData.sentimentCounts.negative,
          ],
          backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        },
      ],
    };
  }, [summaryData.sentimentCounts]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Intent Dashboard
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Overview of your financial intent analysis and insights
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
            <InfoCard
              title="Total Communications"
              value={summaryData.totalIntents}
              icon={<EventNoteIcon />}
              color="#2196f3"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
            <InfoCard
              title="Insights Generated"
              value={summaryData.totalInsights}
              icon={<LightbulbIcon />}
              color="#ff9800"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
            <InfoCard
              title="Cash Flow Concerns"
              value={summaryData.intentCounts.cash_flow_concern}
              icon={<AccountBalanceWalletIcon />}
              color="#f44336"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
            <InfoCard
              title="Budget Planning"
              value={summaryData.intentCounts.budget_planning}
              icon={<BarChartIcon />}
              color="#4caf50"
            />
          </Box>
        </Box>
      </Box>

      {/* Data Visualization */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', md: '58.333%' }, p: 1.5 }}>
            <BarChart title="Financial Intents Distribution" data={intentsChartData} />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '41.667%' }, p: 1.5 }}>
            <BarChart title="Communication Sentiment" data={sentimentChartData} />
          </Box>
        </Box>
      </Box>

      {/* High Priority Insights */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          High Priority Insights
        </Typography>
        
        {insights.filter(insight => insight.priority === 'high').length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {insights
              .filter(insight => insight.priority === 'high')
              .map(insight => (
                <Alert 
                  key={insight.id}
                  severity="warning" 
                  icon={<WarningAmberIcon />}
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {insight.title}
                    </Typography>
                    <Chip 
                      label={insight.category.toUpperCase()} 
                      size="small" 
                      color={insight.category === 'alert' ? 'error' : 'primary'}
                    />
                  </Box>
                  <Typography variant="body2">{insight.description}</Typography>
                </Alert>
              ))}
          </Box>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f7f7f7' }}>
            <Typography align="center" color="text.secondary">
              No high priority insights detected
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Recent Communications */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Communications
        </Typography>
        
        {intents.length > 0 ? (
          <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 3 }}>
            <List disablePadding>
              {intents.slice(-3).map((intent, index) => (
                <React.Fragment key={intent.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                    <ListItemIcon>
                      {intent.intents[0]?.type === 'cash_flow_concern' && <AccountBalanceWalletIcon color="error" />}
                      {intent.intents[0]?.type === 'expense_reduction' && <MoneyOffIcon color="warning" />}
                      {intent.intents[0]?.type === 'revenue_growth' && <TrendingUpIcon color="success" />}
                      {intent.intents[0]?.type === 'budget_planning' && <BarChartIcon color="info" />}
                      {(intent.intents[0]?.type !== 'cash_flow_concern' && 
                        intent.intents[0]?.type !== 'expense_reduction' && 
                        intent.intents[0]?.type !== 'revenue_growth' && 
                        intent.intents[0]?.type !== 'budget_planning') && 
                        <EventNoteIcon color="action" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          {new Date(intent.timestamp).toLocaleString()}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {intent.text}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            {intent.intents.map(i => (
                              <Chip 
                                key={i.type} 
                                label={i.type.split('_').join(' ')} 
                                size="small" 
                                variant="outlined"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            ))}
                            <Chip 
                              label={intent.sentiment.label} 
                              size="small" 
                              color={
                                intent.sentiment.label === 'positive' 
                                  ? 'success' 
                                  : intent.sentiment.label === 'negative' 
                                    ? 'error' 
                                    : 'default'
                              }
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < intents.slice(-3).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f7f7f7' }}>
            <Typography align="center" color="text.secondary">
              No communications analyzed yet
            </Typography>
          </Paper>
        )}
      </Box>
      
      {/* Call to Action */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Button
          component={RouterLink}
          to="/communication"
          variant="contained"
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2,
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)'
          }}
        >
          Add New Communication
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard; 