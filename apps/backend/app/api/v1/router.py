from fastapi import APIRouter
from .endpoints import students, pings, review, auth, dashboard, profile, matching_quiz  # <- add matching_quiz

router = APIRouter()
router.include_router(pings.router)
router.include_router(students.router)
router.include_router(review.router)
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(profile.router)
router.include_router(matching_quiz.router)


@router.get("/health")
async def health():
    return {"status": "ok"}

# alias so main.py can import
api_router = router
