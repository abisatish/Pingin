from fastapi import FastAPI
from .api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CCM API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(api_router, prefix="/api/v1")
