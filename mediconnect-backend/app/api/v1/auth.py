from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from app.services.auth_service import AuthService
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
        data: RegisterRequest,
        db: AsyncSession = Depends(get_db)
):
    """
    Register a new user (patient or doctor).

    - **email**: Valid email address
    - **password**: Minimum 8 characters with uppercase, lowercase, and digit
    - **role**: Either 'patient' or 'doctor'
    - **first_name**: User's first name
    - **last_name**: User's last name
    - **specialty**: Required for doctors
    - **license_number**: Required for doctors
    """
    result = await AuthService.register_user(db, data)

    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"]
    )


@router.post("/login", response_model=TokenResponse)
async def login(
        data: LoginRequest,
        db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password.

    Returns access token and refresh token for authenticated requests.
    """
    result = await AuthService.login_user(db, data)

    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"]
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
        current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information.

    Requires valid JWT token in Authorization header.
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        role=current_user.role
    )


@router.post("/logout")
async def logout(
        current_user: User = Depends(get_current_active_user)
):
    """
    Logout current user.

    Client should delete stored tokens.
    """
    return {"message": "Successfully logged out"}