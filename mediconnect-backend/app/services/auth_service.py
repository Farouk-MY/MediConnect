from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token
)


class AuthService:

    @staticmethod
    async def register_user(
            db: AsyncSession,
            data: RegisterRequest
    ) -> dict:
        """Register a new user."""

        # Check if email already exists
        result = await db.execute(
            select(User).where(User.email == data.email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user = User(
            email=data.email,
            password_hash=get_password_hash(data.password),
            role=data.role
        )
        db.add(user)
        await db.flush()

        # Create role-specific profile
        if data.role == UserRole.PATIENT:
            patient = Patient(
                user_id=user.id,
                first_name=data.first_name,
                last_name=data.last_name
            )
            db.add(patient)

        elif data.role == UserRole.DOCTOR:
            doctor = Doctor(
                user_id=user.id,
                first_name=data.first_name,
                last_name=data.last_name,
                specialty=data.specialty,
                license_number=data.license_number
            )
            db.add(doctor)

        await db.commit()
        await db.refresh(user)

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    async def login_user(
            db: AsyncSession,
            data: LoginRequest
    ) -> dict:
        """Authenticate user and return tokens."""

        # Find user by email
        result = await db.execute(
            select(User).where(User.email == data.email)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Verify password
        if not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token
        }