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
    // Count insights by category
    const insightCounts = {
      alert: insights.filter(i => i.category === 'alert').length,
      suggestion: insights.filter(i => i.category === 'suggestion').length,
      forecast: insights.filter(i => i.category === 'forecast').length
    };

    // Count insights by priority
    const priorityCounts = {
      high: insights.filter(i => i.priority === 'high').length,
      medium: insights.filter(i => i.priority === 'medium').length,
      low: insights.filter(i => i.priority === 'low').length
    };

    // Get total detected intents from insights
    const totalDetectedIntents = insights.reduce((count, insight) => {
      // Each forecast insight represents one detected intent
      if (insight.category === 'forecast') {
        return count + 1;
      }
      return count;
    }, 0);

    return {
      totalIntents: totalDetectedIntents,
      totalInsights: insights.length,
      highPriorityInsights: priorityCounts.high,
      insightCounts,
      priorityCounts
    };
  }, [intents, insights]);

  // Chart data for insights distribution
  const insightsChartData = useMemo(() => {
    return {
      labels: ['Alerts', 'Suggestions', 'Forecasts'],
      datasets: [
        {
          label: 'Insights by Category',
          data: [
            summaryData.insightCounts.alert,
            summaryData.insightCounts.suggestion,
            summaryData.insightCounts.forecast
          ],
          backgroundColor: ['#f44336', '#ff9800', '#2196f3'],
        },
      ],
    };
  }, [summaryData.insightCounts]);

  // Chart data for priority distribution
  const priorityChartData = useMemo(() => {
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          label: 'Insights by Priority',
          data: [
            summaryData.priorityCounts.high,
            summaryData.priorityCounts.medium,
            summaryData.priorityCounts.low
          ],
          backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
        },
      ],
    };
  }, [summaryData.priorityCounts]);

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
              title="Total Intents Detected"
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
              title="High Priority Alerts"
              value={summaryData.highPriorityInsights}
              icon={<WarningAmberIcon />}
              color="#f44336"
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
            <InfoCard
              title="Forecasts"
              value={summaryData.insightCounts.forecast}
              icon={<TrendingUpIcon />}
              color="#4caf50"
            />
          </Box>
        </Box>
      </Box>

      {/* Data Visualization */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
            <BarChart title="Insights by Category" data={insightsChartData} />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
            <BarChart title="Insights by Priority" data={priorityChartData} />
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

      {/* Recent Insights */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Insights
        </Typography>

        {insights.length > 0 ? (
          <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 3 }}>
            <List disablePadding>
              {insights.slice(-3).map((insight, index) => (
                <React.Fragment key={insight.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2, px: 3 }}>
                    <ListItemIcon>
                      {insight.category === 'alert' && <WarningAmberIcon color="error" />}
                      {insight.category === 'suggestion' && <LightbulbIcon color="warning" />}
                      {insight.category === 'forecast' && <TrendingUpIcon color="success" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                          {insight.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {insight.description}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip
                              label={insight.category}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Chip
                              label={insight.priority}
                              size="small"
                              color={
                                insight.priority === 'high'
                                  ? 'error'
                                  : insight.priority === 'medium'
                                    ? 'warning'
                                    : 'success'
                              }
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < insights.slice(-3).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#f7f7f7' }}>
            <Typography align="center" color="text.secondary">
              No insights generated yet
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