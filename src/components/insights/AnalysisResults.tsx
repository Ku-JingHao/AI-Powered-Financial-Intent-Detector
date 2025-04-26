import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InsightTabs from './InsightTabs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface AnalysisResultsProps {
  analysisResults: {
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
    summary?: {
      total_intents: number;
      high_urgency_intents: number;
      total_alerts: number;
      total_suggestions: number;
      overall_urgency: string;
    };
  };
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResults }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { alerts, suggestions } = analysisResults.financial_intents;
  const summary = analysisResults.summary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        mb: 4,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analysis Results
        </Typography>
        {summary && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Alerts
              </Typography>
              <Typography variant="h6" color="error.main">
                {summary.total_alerts}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Suggestions
              </Typography>
              <Typography variant="h6" color="warning.main">
                {summary.total_suggestions}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(33, 150, 243, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 120,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Overall Urgency
              </Typography>
              <Typography 
                variant="h6" 
                color={
                  summary.overall_urgency === 'high' 
                    ? 'error.main' 
                    : summary.overall_urgency === 'medium' 
                      ? 'warning.main' 
                      : 'success.main'
                }
                sx={{ textTransform: 'capitalize' }}
              >
                {summary.overall_urgency}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          '& .MuiTab-root': {
            minWidth: 'auto',
            px: 3,
          },
          mb: 2,
        }}
      >
        <Tab 
          icon={<WarningIcon />} 
          iconPosition="start" 
          label="Alerts" 
        />
        <Tab 
          icon={<TipsAndUpdatesIcon />} 
          iconPosition="start" 
          label="Suggestions" 
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <InsightTabs 
          alerts={alerts} 
          suggestions={[]} 
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <InsightTabs 
          alerts={[]} 
          suggestions={suggestions} 
        />
      </TabPanel>
    </Paper>
  );
};

export default AnalysisResults;