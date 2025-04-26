from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from SentimentAnalysis.financial_intent_analyzer import FinancialIntentAnalyzer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verify OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    logger.error("OPENAI_API_KEY is not set in environment variables")
    raise ValueError("OPENAI_API_KEY environment variable is required")

class TextInput(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(input: TextInput):
    try:
        logger.info(f"Received text for analysis: {input.text[:100]}...")  # Log first 100 chars
        analyzer = FinancialIntentAnalyzer()
        results = analyzer.analyze_financial_text(input.text)
        logger.info(f"Analysis results: {results}")  # Log the results
        return results
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 