import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import cohere
import requests
from bs4 import BeautifulSoup

load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("Missing COHERE_API_KEY in environment variables.")

# Initialize Cohere client with the latest API
client = cohere.ClientV2(COHERE_API_KEY)  # Use ClientV2 for the latest API

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str
    mode: str = "caption"

class AnalyzeRequest(BaseModel):
    link: str

@router.post("/generate")
async def generate_content(req: GenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    mode_prompts = {
        "caption": f"Write a short catchy social media caption: {prompt}",
        "description": f"Write a professional product description: {prompt}",
        "idea": f"Suggest a creative influencer campaign for: {prompt}",
    }
    final_prompt = mode_prompts.get(req.mode, prompt)

    try:
        # Using Cohere's latest Chat API with current models
        response = client.chat(
            model='command-r-08-2024',
            messages=[{"role": "user", "content": final_prompt}],
            max_tokens=300,
            temperature=0.7
        )
        
        text = response.text
        return {"mode": req.mode, "result": text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {e}")

@router.post("/analyze-product")
async def analyze_product_link(payload: AnalyzeRequest):
    link = payload.link.strip()
    if not link or not link.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid link")

    try:
        resp = requests.get(link, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.string.strip() if soup.title else ""
        meta_desc = (
            (soup.find("meta", attrs={"name": "description"}) or
             soup.find("meta", attrs={"property": "og:description"}))
        )
        description = meta_desc.get("content", "").strip() if meta_desc else ""

        # Use Cohere Chat API to generate campaign suggestions
        prompt = (
            f"Product Title: {title}\n"
            f"Description: {description}\n"
            "Generate campaign title, description, requirements, category, and a suggested budget."
        )

        response = client.chat(
            model='command-r-08-2024',
            messages=prompt,
            max_tokens=300,
            temperature=0.7
        )
        
        ai_text = response.text

        return {
            "data": {
                "title": title,
                "description": description,
                "ai_suggestions": ai_text.strip(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyze error: {e}")