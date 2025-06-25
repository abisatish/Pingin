from fastapi import APIRouter
from .endpoints import students, pings, review, auth  # <- add users

router = APIRouter()
router.include_router(pings.router)
router.include_router(students.router)
router.include_router(review.router)
router.include_router(auth.router)


@router.get("/health")
async def health():
    return {"status": "ok"}

# alias so main.py can import
api_router = router
