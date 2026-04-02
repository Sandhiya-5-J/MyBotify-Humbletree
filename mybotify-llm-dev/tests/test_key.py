import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import google.generativeai as genai

genai.configure(api_key="AIzaSyCeT9OZpycx92I2apuHr8H-6RmTYvZf6FY")

model = genai.GenerativeModel("gemini-2.0-flash")

try:
    response = model.generate_content("Say hello")
    print("SUCCESS:", response.text)
except Exception as e:
    print("ERROR:", type(e).__name__)
    print("DETAILS:", e)
