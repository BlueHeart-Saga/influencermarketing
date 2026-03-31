# chatbot.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import cohere

# Load environment variables
load_dotenv()

router = APIRouter()

# Get API key from .env file
API_KEY = os.getenv("COHERE_API_KEY")

if not API_KEY:
    raise Exception("❌ COHERE_API_KEY not found in .env file")

# Initialize Cohere client
client = cohere.ClientV2(api_key=API_KEY)

# Request schema
class ChatRequest(BaseModel):
    prompt: str

# API endpoint
@router.post("/generate")
async def generate_chat(req: ChatRequest):
    try:
        response = client.chat(
            model="command-r-plus-08-2024",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful marketing assistant and friendly AI. Provide influencer and ad campaign ideas. Write in concise bullet points. Give 5 points in a friendly tone."
                },
                {
                    "role": "user", 
                    "content": req.prompt
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return {"response": response.message.content[0].text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cohere API error: {str(e)}")



# # ===== Chatbot / AI Endpoint =====
# @app.post("/generate", response_model=ChatResponse)
# def generate_code(request: PromptRequest):
#     try:
#         response = model.generate_content(request.prompt)
#         bot_response = response.text
#         # Optional: log chat
#         chats_collection.insert_one({
#             "prompt": request.prompt,
#             "response": bot_response,
#             "timestamp": datetime.utcnow()
#         })
#         return ChatResponse(response=bot_response)
#     except Exception as e:
#         print(f"Error in /generate: {e}")
#         raise HTTPException(status_code=500, detail="Failed to generate content")