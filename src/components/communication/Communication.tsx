import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Fade,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';

import { useFinancial } from '../../context/FinancialContext';
import { startRecording, transcribeAudioFile } from '../../services/speechService';
import { analyzeText } from '../../services/sentimentService';
import { TabPanel } from './TabPanel';

const Communication: React.FC = () => {
  const { addIntent, addAnalysisResults, loading: processingIntent } = useFinancial();
  const [tabValue, setTabValue] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [recordingState, setRecordingState] = useState<{
    isRecording: boolean;
    recordedText: string;
  }>({
    isRecording: false,
    recordedText: '',
  });
  const stopRecordingRef = useRef<{ stop: () => void } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<{
    uploading: boolean;
    transcribedText: string;
    error: string;
  }>({
    uploading: false,
    transcribedText: '',
    error: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [sentimentResults, setSentimentResults] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleTextSubmit = async (text: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setSentimentResults(data);
      addAnalysisResults(data);
      await addIntent(text);
      setSuccessMessage('Text analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing text:', error);
      setSnackbar({
        open: true,
        message: 'Failed to analyze text. Please try again.',
        severity: 'error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartRecording = () => {
    setRecordingState({
      isRecording: true,
      recordedText: '',
    });

    stopRecordingRef.current = startRecording(
      (text) => {
        setRecordingState((prev) => ({
          ...prev,
          recordedText: text,
        }));
      },
      (status) => {
        if (!status) {
          setRecordingState((prev) => ({
            ...prev,
            isRecording: false,
          }));
        }
      }
    );
  };

  const handleStopRecording = () => {
    if (stopRecordingRef.current) {
      stopRecordingRef.current.stop();
      stopRecordingRef.current = null;
    }
  };

  const handleRecordingSubmit = async () => {
    if (!recordingState.recordedText.trim()) return;

    try {
      setAnalyzing(true);
      const results = await analyzeText(recordingState.recordedText);
      setSentimentResults(results);
      await addIntent(recordingState.recordedText);
      setRecordingState({
        isRecording: false,
        recordedText: '',
      });
      setSuccessMessage('Voice communication analyzed successfully!');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to analyze voice communication.',
        severity: 'error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({
      uploading: true,
      transcribedText: '',
      error: '',
    });
    setUploadProgress(0);

    try {
      await transcribeAudioFile(
        file,
        (progress) => {
          setUploadProgress(progress);
        },
        (text) => {
          setUploadState({
            uploading: false,
            transcribedText: text,
            error: '',
          });
          setUploadProgress(100);
        },
        (error) => {
          setUploadState({
            uploading: false,
            transcribedText: '',
            error,
          });
          setUploadProgress(0);
          setSnackbar({
            open: true,
            message: `Error processing audio file: ${error}`,
            severity: 'error',
          });
        }
      );
    } catch (error) {
      setUploadState({
        uploading: false,
        transcribedText: '',
        error: 'Failed to process audio file',
      });
      setUploadProgress(0);
      setSnackbar({
        open: true,
        message: 'Failed to process audio file',
        severity: 'error',
      });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadState.transcribedText.trim()) return;

    try {
      setAnalyzing(true);
      const results = await analyzeText(uploadState.transcribedText);
      setSentimentResults(results);
      await addIntent(uploadState.transcribedText);
      setUploadState({
        uploading: false,
        transcribedText: '',
        error: '',
      });
      setSuccessMessage('Uploaded communication analyzed successfully!');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to analyze uploaded communication.',
        severity: 'error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleClearTranscription = () => {
    setUploadState({
      uploading: false,
      transcribedText: '',
      error: '',
    });
    setUploadProgress(0);
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Communication Analysis
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Add financial communications to detect intents and generate insights
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          mb: 4
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab label="Text Input" />
          <Tab label="Voice Memo" />
          <Tab label="Audio Upload" />
        </Tabs>

        {/* Text Input Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="Enter financial communication"
              multiline
              rows={6}
              value={textInput}
              onChange={handleTextInputChange}
              fullWidth
              placeholder="Example: I'm concerned about our cashflow situation this quarter. We need to reduce expenses and improve our collections process."
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SendIcon />}
                onClick={() => handleTextSubmit(textInput)}
                disabled={!textInput.trim() || processingIntent}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {processingIntent ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Voice Recording Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                p: 3,
                borderRadius: 3,
                backgroundColor: recordingState.isRecording ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: recordingState.isRecording ? 'error.main' : 'primary.main',
                borderStyle: 'dashed',
              }}
            >
              <Box sx={{ mb: 2 }}>
                {recordingState.isRecording ? (
                  <IconButton
                    onClick={handleStopRecording}
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      p: 3,
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  >
                    <StopIcon fontSize="large" />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={handleStartRecording}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      p: 3,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <MicIcon fontSize="large" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                {recordingState.isRecording ? 'Recording in progress...' : 'Press to start recording'}
              </Typography>
              <Typography color="text.secondary" variant="body2" align="center">
                {recordingState.isRecording
                  ? 'Speak clearly and talk about your financial concerns or plans'
                  : 'You can record your voice to analyze financial intents'
                }
              </Typography>
            </Paper>

            {recordingState.recordedText && (
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Transcription:
                </Typography>
                <Typography variant="body1" paragraph>
                  {recordingState.recordedText}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={handleRecordingSubmit}
                    disabled={!recordingState.recordedText.trim() || processingIntent}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    {processingIntent ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Audio Upload Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                p: 3,
                borderRadius: 3,
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'primary.main',
                borderStyle: 'dashed',
              }}
            >
              <Box sx={{ mb: 2 }}>
                <IconButton
                  component="label"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    p: 3,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  disabled={uploadState.uploading}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleFileUpload}
                  />
                  <UploadFileIcon fontSize="large" />
                </IconButton>
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                Upload Audio File
              </Typography>
              <Typography color="text.secondary" variant="body2" align="center">
                Select an audio file containing financial communication
              </Typography>

              {uploadState.uploading && (
                <Box sx={{ width: '100%', mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={uploadProgress}
                    size={24}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Processing audio ({uploadProgress}%)...
                  </Typography>
                </Box>
              )}
            </Paper>

            {uploadState.transcribedText && (
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Transcription:
                  </Typography>
                  <IconButton size="small" onClick={handleClearTranscription}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body1" paragraph>
                  {uploadState.transcribedText}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={handleUploadSubmit}
                    disabled={!uploadState.transcribedText.trim() || processingIntent}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    {processingIntent ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                  </Button>
                </Box>
              </Paper>
            )}

            {uploadState.error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {uploadState.error}
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Tips Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: 'rgba(76, 175, 80, 0.05)',
          border: 1,
          borderColor: 'success.light',
          borderStyle: 'solid',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
          Tips for Better Analysis
        </Typography>
        <List dense disablePadding>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Be specific about financial concerns or goals"
              primaryTypographyProps={{ color: 'text.primary', variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Mention specific areas like cash flow, expenses, revenue, or budget planning"
              primaryTypographyProps={{ color: 'text.primary', variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="Include timeframes when discussing financial matters (this quarter, next year, etc.)"
              primaryTypographyProps={{ color: 'text.primary', variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemText
              primary="For voice input, speak clearly and at a moderate pace"
              primaryTypographyProps={{ color: 'text.primary', variant: 'body2' }}
            />
          </ListItem>
        </List>
      </Paper>

      {sentimentResults && (
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: 3,
            mt: 4,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Sentiment Analysis Results
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Urgency: {sentimentResults.summary.overall_urgency}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Intents: {sentimentResults.summary.total_intents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Urgency Intents: {sentimentResults.summary.high_urgency_intents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Alerts: {sentimentResults.summary.total_alerts}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detected Financial Intents
            </Typography>
            <List>
              {sentimentResults.financial_intents.detected_intents.map((intent: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={intent.description}
                    secondary={`Urgency: ${intent.urgency_level} (${intent.urgency_score}) - Timeline: ${intent.timeline}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {sentimentResults.financial_intents.expenditures.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Potential Expenditures
              </Typography>
              <List>
                {sentimentResults.financial_intents.expenditures.map((expenditure: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={expenditure.type}
                      secondary={`Amount: ${expenditure.amount} | Timeline: ${expenditure.timeline}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {sentimentResults.financial_intents.revenue_actions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Revenue Actions
              </Typography>
              <List>
                {sentimentResults.financial_intents.revenue_actions.map((action: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={action.type}
                      secondary={`Target: ${action.target} | Timeline: ${action.timeline}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {sentimentResults.financial_intents.alerts.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom color="error">
                Alerts
              </Typography>
              <List>
                {sentimentResults.financial_intents.alerts.map((alert: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={alert.message}
                      secondary={`Impact: ${alert.impact}\nRecommendation: ${alert.recommendation}`}
                      primaryTypographyProps={{ color: 'error.main' }}
                      secondaryTypographyProps={{
                        component: 'div',
                        sx: { whiteSpace: 'pre-line' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {sentimentResults.financial_intents.suggestions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom color="success.main">
                Suggestions
              </Typography>
              <List>
                {sentimentResults.financial_intents.suggestions.map((suggestion: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={suggestion.message}
                      secondary={`Benefit: ${suggestion.benefit}\nImplementation: ${suggestion.implementation}`}
                      primaryTypographyProps={{ color: 'success.main' }}
                      secondaryTypographyProps={{
                        component: 'div',
                        sx: { whiteSpace: 'pre-line' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Communication;