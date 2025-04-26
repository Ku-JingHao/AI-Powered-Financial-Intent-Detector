import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  useTheme,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

interface AlertItem {
  message: string;
  severity: string;
  impact: string;
  recommendation: string;
}

interface SuggestionItem {
  message: string;
  benefit: string;
  implementation: string;
  priority: string;
}

interface InsightTabsProps {
  alerts: AlertItem[];
  suggestions: SuggestionItem[];
}

const InsightTabs: React.FC<InsightTabsProps> = ({ alerts, suggestions }) => {
  const theme = useTheme();

  // Get priority color based on severity/priority
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Box>
      {/* Alerts Tab */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
          Alerts
          {alerts.length > 0 && (
            <Chip
              label={alerts.length}
              size="small"
              color="error"
              sx={{ ml: 2, height: 24, fontSize: '0.75rem' }}
            />
          )}
        </Typography>
        
        {alerts.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert, index) => (
              <Paper
                key={`alert-${index}`}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: 4,
                  borderColor: getPriorityColor(alert.severity),
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 2 }}>
                      <WarningIcon sx={{ color: getPriorityColor(alert.severity) }} />
                    </Box>
                    <Typography variant="h6">{alert.message}</Typography>
                  </Box>
                  <Chip
                    label={alert.severity.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: `${getPriorityColor(alert.severity)}20`,
                      color: getPriorityColor(alert.severity),
                      fontWeight: 'bold',
                      borderRadius: 1,
                    }}
                  />
                </Box>

                <Typography variant="body1" paragraph>
                  <strong>Impact:</strong> {alert.impact}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Recommendation:</strong> {alert.recommendation}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label="ALERT"
                    size="small"
                    color="error"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No alerts detected in your financial communications.
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Suggestions Tab */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TipsAndUpdatesIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
          Suggestions
          {suggestions.length > 0 && (
            <Chip
              label={suggestions.length}
              size="small"
              color="warning"
              sx={{ ml: 2, height: 24, fontSize: '0.75rem' }}
            />
          )}
        </Typography>
        
        {suggestions.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {suggestions.map((suggestion, index) => (
              <Paper
                key={`suggestion-${index}`}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: 4,
                  borderColor: getPriorityColor(suggestion.priority),
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 2 }}>
                      <TipsAndUpdatesIcon sx={{ color: getPriorityColor(suggestion.priority) }} />
                    </Box>
                    <Typography variant="h6">{suggestion.message}</Typography>
                  </Box>
                  <Chip
                    label={suggestion.priority.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: `${getPriorityColor(suggestion.priority)}20`,
                      color: getPriorityColor(suggestion.priority),
                      fontWeight: 'bold',
                      borderRadius: 1,
                    }}
                  />
                </Box>

                <Typography variant="body1" paragraph>
                  <strong>Benefit:</strong> {suggestion.benefit}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Implementation:</strong> {suggestion.implementation}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label="SUGGESTION"
                    size="small"
                    color="warning"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No suggestions available for your financial communications.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default InsightTabs;