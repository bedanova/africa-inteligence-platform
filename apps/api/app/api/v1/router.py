from fastapi import APIRouter
from app.api.v1 import home, countries

router = APIRouter(prefix="/v1")
router.include_router(home.router, tags=["Home"])
router.include_router(countries.router, tags=["Countries"])
