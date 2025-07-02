from fastapi import APIRouter
from .endpoints import students, pings, review, auth, dashboard, profile, matching_quiz, college_selection, matching, consultant_matching_quiz, consultants, tasks  # <- add new routers

router = APIRouter()
router.include_router(pings.router)
router.include_router(students.router)
router.include_router(review.router)
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(profile.router)
router.include_router(matching_quiz.router)
router.include_router(college_selection.router)
router.include_router(matching.router)
router.include_router(consultant_matching_quiz.router)
router.include_router(consultants.router)
router.include_router(tasks.router)

@router.get("/health")
async def health():
    return {"status": "ok"}

# alias so main.py can import
api_router = router
