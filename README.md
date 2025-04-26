# Financial Intent Detector

An AI-powered tool that analyzes casual communications (text and voice) to extract financial intent and convert it into actionable financial insights for small businesses.

## About the Project

This application helps small business owners by:

- Analyzing text and voice communications to detect financial intents
- Converting unstructured financial communications into structured insights
- Providing actionable recommendations and alerts based on detected intents
- Monitoring financial sentiment and identifying potential risks

## Features

- **Text Analysis**: Enter financial communications for intent detection
- **Voice Recording**: Record voice memos for real-time financial intent analysis
- **Audio Upload**: Upload audio files containing financial discussions
- **Financial Insights**: View actionable insights categorized as alerts, suggestions, and forecasts
- **Dashboard**: Get an overview of financial health with key metrics and visualizations

## Technology Stack

- **Frontend**: React.js with TypeScript
- **UI Framework**: Material UI for components and styling
- **Voice Processing**: Microsoft Azure Speech Services for voice-to-text conversion
- **State Management**: React Context API
- **Data Visualization**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/financial-intent-detector.git
   cd financial-intent-detector
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Azure Speech Services credentials:
   ```
   REACT_APP_AZURE_SPEECH_KEY=your_azure_speech_key
   REACT_APP_AZURE_SPEECH_REGION=your_azure_speech_region
   ```

4. Start the development server
   ```bash
   npm start
   ```

## Usage

1. **Dashboard**: View your financial health overview and insights on the home page
2. **Add Communications**: Navigate to the Communication page to add financial text, record voice memos, or upload audio files
3. **View Insights**: Check the Insights page for actionable financial recommendations categorized by priority and type

## Future Enhancements

- Integration with financial data sources for more accurate insights
- Advanced NLP models for better financial intent detection
- Export insights to PDF or spreadsheets
- Mobile app for on-the-go financial intent capture
- Integration with accounting software and financial planning tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft Azure Speech Services for voice-to-text functionality
- Material UI for the component library
- React and TypeScript for the development framework
