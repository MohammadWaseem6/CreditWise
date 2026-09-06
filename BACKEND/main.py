
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello from CreditWise!"}

@app.get("/hello")
def hello():
    return {"message": "API is working perfectly! 🎉"}
