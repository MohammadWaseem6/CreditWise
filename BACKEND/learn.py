from fastapi import FastAPI  # ✅ CORRECT - all lowercase


app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to the FastAPI application!"}

@app.get("/about")
def about():
    return {"message": "This is a simple FastAPI application."}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}

@app.get("/name/{myname}")
def read_name(myname: str):
    return {"name": myname}