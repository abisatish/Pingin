from fastapi import FastAPI
from .api.v1.router import api_router  # we add in the next step

app = FastAPI(title="CCM API", version="1.0")
app.include_router(api_router, prefix="/api/v1")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

