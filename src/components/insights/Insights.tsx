import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  Button,
  Alert,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

import { useFinancial } from '../../context/FinancialContext';
import { FinancialInsight } from '../../services/financialIntentService';
import { Link as RouterLink } from 'react-router-dom';

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
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

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

const transformAnalysisToInsights = (analysis: AnalysisResult): FinancialInsight[] => {
  const insights: FinancialInsight[] = [];
  const now = new Date().toISOString();

  // Transform alerts
  analysis.financial_intents.alerts.forEach((alert, index) => {
    insights.push({
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
  analysis.financial_intents.suggestions.forEach((suggestion, index) => {
    insights.push({
      id: `suggestion-${index}-${now}`,
      title: suggestion.message,
      description: `Benefit: ${suggestion.benefit}\n\nImplementation: ${suggestion.implementation}`,
      category: 'suggestion',
      priority: suggestion.priority as 'low' | 'medium' | 'high',
      relatedIntentIds: [],
      timestamp: now
    });
  });

  return insights;
};

const Insights: React.FC = () => {
  const { insights: contextInsights, intents, clearAll } = useFinancial();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'date'>('priority');
  const [filter, setFilter] = useState<'all' | 'high'>('all');
  const open = Boolean(anchorEl);

  // Group insights by category
  const groupedInsights = useMemo(() => {
    const groups = {
      alert: contextInsights.filter((insight) => insight.category === 'alert'),
      suggestion: contextInsights.filter((insight) => insight.category === 'suggestion'),
      forecast: contextInsights.filter((insight) => insight.category === 'forecast'),
    };

    // Apply sorting
    const sortInsights = (insights: FinancialInsight[]) => {
      return [...insights].sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
      });
    };

    // Apply filtering
    const filterInsights = (insights: FinancialInsight[]) => {
      return filter === 'high'
        ? insights.filter(insight => insight.priority === 'high')
        : insights;
    };

    return {
      alert: filterInsights(sortInsights(groups.alert)),
      suggestion: filterInsights(sortInsights(groups.suggestion)),
      forecast: filterInsights(sortInsights(groups.forecast)),
    };
  }, [contextInsights, sortBy, filter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (type: 'priority' | 'date') => {
    setSortBy(type);
    handleMenuClose();
  };

  const handleFilterChange = (type: 'all' | 'high') => {
    setFilter(type);
    handleMenuClose();
  };

  const handleClearAll = () => {
    clearAll();
  };

  // Get insight icon based on category
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'alert':
        return <WarningIcon sx={{ color: theme.palette.error.main }} />;
      case 'suggestion':
        return <TipsAndUpdatesIcon sx={{ color: theme.palette.warning.main }} />;
      case 'forecast':
        return <TrendingUpIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <TipsAndUpdatesIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Insights
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Actionable insights derived from your financial communications
        </Typography>
      </Box>

      {/* Filter and Sort Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3
            }
          }}
        >
          <Tab label="All" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Alerts</span>
                {groupedInsights.alert.length > 0 && (
                  <Chip
                    label={groupedInsights.alert.length}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Suggestions</span>
                {groupedInsights.suggestion.length > 0 && (
                  <Chip
                    label={groupedInsights.suggestion.length}
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Forecasts</span>
                {groupedInsights.forecast.length > 0 && (
                  <Chip
                    label={groupedInsights.forecast.length}
                    size="small"
                    color="info"
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>

        <Box>
          <IconButton
            size="small"
            sx={{ mr: 1 }}
            aria-label="sort"
            onClick={handleMenuClick}
          >
            <SortIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            aria-label="filter"
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleFilterChange('all')}>
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Show All</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange('high')}>
              <ListItemIcon>
                <HighlightOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>High Priority Only</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleSortChange('date')}>
              <ListItemIcon>
                <CalendarTodayIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Recent First</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('priority')}>
              <ListItemIcon>
                <WarningIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Priority Order</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Insights Panels */}
      <TabPanel value={tabValue} index={0}>
        {contextInsights.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {contextInsights.map((insight) => (
              <Box key={insight.id}>
                <InsightCard insight={insight} icon={getInsightIcon(insight.category)} priorityColor={getPriorityColor(insight.priority)} />
              </Box>
            ))}
          </Box>
        ) : (
          <NoInsightsMessage />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {groupedInsights.alert.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {groupedInsights.alert.map((insight) => (
              <Box key={insight.id}>
                <InsightCard insight={insight} icon={getInsightIcon(insight.category)} priorityColor={getPriorityColor(insight.priority)} />
              </Box>
            ))}
          </Box>
        ) : (
          <NoInsightsMessage category="alerts" />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {groupedInsights.suggestion.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {groupedInsights.suggestion.map((insight) => (
              <Box key={insight.id}>
                <InsightCard insight={insight} icon={getInsightIcon(insight.category)} priorityColor={getPriorityColor(insight.priority)} />
              </Box>
            ))}
          </Box>
        ) : (
          <NoInsightsMessage category="suggestions" />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {groupedInsights.forecast.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {groupedInsights.forecast.map((insight) => (
              <Box key={insight.id}>
                <InsightCard insight={insight} icon={getInsightIcon(insight.category)} priorityColor={getPriorityColor(insight.priority)} />
              </Box>
            ))}
          </Box>
        ) : (
          <NoInsightsMessage category="forecasts" />
        )}
      </TabPanel>

      {/* Tips Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(33, 150, 243, 0.05)',
          border: 1,
          borderColor: 'primary.light',
          borderStyle: 'solid',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary.main">
            How Insights Work
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          Our AI analyzes your financial communications and detects patterns and concerns. Based on this analysis,
          we generate actionable insights in three categories:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip
            icon={<WarningIcon />}
            label="Alerts"
            variant="outlined"
            color="error"
            sx={{ borderRadius: 2 }}
          />
          <Chip
            icon={<TipsAndUpdatesIcon />}
            label="Suggestions"
            variant="outlined"
            color="warning"
            sx={{ borderRadius: 2 }}
          />
          <Chip
            icon={<TrendingUpIcon />}
            label="Forecasts"
            variant="outlined"
            color="info"
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Typography variant="body2" color="textSecondary" component="span">
          <Chip label="cash flow" size="small" variant="outlined" sx={{ mr: 1 }} />
          <Chip label="expenses" size="small" variant="outlined" sx={{ mr: 1 }} />
        </Typography>
      </Paper>
    </Container>
  );
};

interface InsightCardProps {
  insight: FinancialInsight;
  icon: React.ReactNode;
  priorityColor: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, icon, priorityColor }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewDetails = () => {
    // TODO: Implement view details functionality
    handleMenuClose();
  };

  const handleDismiss = () => {
    // TODO: Implement dismiss functionality
    handleMenuClose();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        borderLeft: 4,
        borderColor: priorityColor,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>{icon}</Box>
          <Typography variant="h6">{insight.title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={insight.priority.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: `${priorityColor}20`,
              color: priorityColor,
              fontWeight: 'bold',
              borderRadius: 1,
            }}
          />
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewDetails}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDismiss}>
              <ListItemIcon>
                <CloseIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dismiss</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        {insight.description}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Chip
          label={insight.category.toUpperCase()}
          size="small"
          color={
            insight.category === 'alert'
              ? 'error'
              : insight.category === 'suggestion'
                ? 'warning'
                : 'info'
          }
          sx={{ borderRadius: 1 }}
        />
        <Button
          size="small"
          color="primary"
          variant="text"
          sx={{ textTransform: 'none', fontWeight: 'medium' }}
        >
          View Related Communications
        </Button>
      </Box>
    </Paper>
  );
};

interface NoInsightsMessageProps {
  category?: string;
}

const NoInsightsMessage: React.FC<NoInsightsMessageProps> = ({ category = 'insights' }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        backgroundColor: 'rgba(0,0,0,0.01)',
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No {category} available yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Add more financial communications to generate {category}
      </Typography>
      <Button
        component={RouterLink}
        to="/communication"
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2, px: 3 }}
      >
        Add Communication
      </Button>
    </Box>
  );
};

export default Insights; 