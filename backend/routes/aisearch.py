# aisearch.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langdetect import detect, DetectorFactory, LangDetectException
from textblob import TextBlob

# ------------------------------
# Load environment variables
# ------------------------------
load_dotenv()
GENAI_API_KEY = os.getenv("GENAI_API_KEY")

if not GENAI_API_KEY:
    raise Exception("❌ GENAI_API_KEY not found in .env file")

# Configure Gemini
genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-pro-preview-03-25")

# ------------------------------
# Router
# ------------------------------
router = APIRouter()

# ------------------------------
# Request schemas
# ------------------------------
class GenerateRequest(BaseModel):
    prompt: str
    mode: str = "caption"  # default mode

# ------------------------------
# Content generation endpoint
# ------------------------------
@router.post("/generate")
async def generate_content(req: GenerateRequest):
    try:
        # Build system prompt depending on mode
        system_prompt = "You are a helpful assistant.if i ask anything you answer.  Provide clear suggestions in bullet points."
        if req.mode.lower() == "caption":
            system_prompt += " Generate engaging captions for social media posts with one by one points format."
        elif req.mode.lower() == "adcopy":
            system_prompt += " Generate persuasive ad copy for social media."
        elif req.mode.lower() == "hashtag":
            system_prompt += " Suggest trending hashtags based on the content."

        response = model.generate_content([system_prompt, req.prompt])
        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# ------------------------------
# Safe language detection function
# ------------------------------
DetectorFactory.seed = 0  # ensure reproducibility

def safe_language_detect(text: str):
    try:
        if len(text.strip()) < 3:
            return "unknown"
        return detect(text)
    except LangDetectException:
        return "unknown"

# ------------------------------
# Live analysis endpoint
# ------------------------------
@router.get("/analyze")
async def analyze_text(text: str):
    try:
        text = text.strip()
        if not text:
            return {"language": "unknown", "sentiment": "Neutral", "keywords": []}

        # Language detection
        language = safe_language_detect(text)

        # Sentiment analysis
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            if polarity > 0.1:
                sentiment = "Positive"
            elif polarity < -0.1:
                sentiment = "Negative"
            else:
                sentiment = "Neutral"
        except:
            sentiment = "Neutral"

        # Keywords extraction (simple: top nouns)
        try:
            words = [word for word, pos in blob.tags if pos.startswith("NN")]
            keywords = list(set(words))[:10]
        except:
            keywords = []

        return {
            "language": language,
            "sentiment": sentiment,
            "keywords": keywords
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis error: {str(e)}")


