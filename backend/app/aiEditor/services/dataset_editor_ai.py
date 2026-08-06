import json

from google import genai

from google.genai import types

from app.config import GEMINI_API_KEY

from app.aiEditor.services.dataset_editor_prompt import (
    build_dataset_editor_prompt
)

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_edit_plan(

    schema,

    sample_data,

    user_request

):

    prompt = build_dataset_editor_prompt(

        schema,

        sample_data,

        user_request

    )

    response = client.models.generate_content(
    model="gemini-3.1-flash-lite",   # <-- yahi likhna hai, gemini-2.5 nahi
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json"
    )
)

     

    
    print("DEBUG -> RAW GEMINI RESPONSE:", response.text) 

    return json.loads(response.text)