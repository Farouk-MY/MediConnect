from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User, UserRole
from app.schemas.doctor import (
    DoctorResponse,
    DoctorPublicProfile,
    DoctorUpdateRequest,
    ConsultationTypeConfigRequest
)
from app.services.doctor_service import DoctorService
from app.core.websocket import profile_manager

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/me", response_model=DoctorResponse)
async def get_my_profile(
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Get current doctor's profile.

    Requires doctor role.
    """
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint"
        )

    doctor = await DoctorService.get_doctor_by_user_id(db, current_user.id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )

    return doctor


@router.put("/me", response_model=DoctorResponse)
async def update_my_profile(
        data: DoctorUpdateRequest,
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Update current doctor's profile.

    Can update:
    - Professional info (US006): specialty, experience, bio, education
    - Cabinet info (US007): address, phone, pricing, payment methods
    - Consultation types (US008): presentiel, online, fees
    """
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint"
        )

    doctor = await DoctorService.update_doctor_profile(db, current_user.id, data)
    
    # Broadcast real-time update via WebSocket
    await profile_manager.broadcast_to_user(
        str(current_user.id),
        {
            "type": "profile_update",
            "data": DoctorResponse.model_validate(doctor).model_dump(mode='json')
        }
    )
    
    return doctor


@router.put("/me/consultation-types", response_model=DoctorResponse)
async def configure_consultation_types(
        data: ConsultationTypeConfigRequest,
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Configure consultation types and pricing (US008).

    Allows doctor to specify:
    - Which consultation types they offer (presentiel/online)
    - Pricing for each type

    At least one consultation type must be enabled.
    """
    if current_user.role != UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this endpoint"
        )

    doctor = await DoctorService.configure_consultation_types(db, current_user.id, data)
    return doctor


@router.get("/search", response_model=List[DoctorPublicProfile])
async def search_doctors(
        specialty: Optional[str] = Query(None, description="Filter by specialty"),
        city: Optional[str] = Query(None, description="Filter by city"),
        doctor_name: Optional[str] = Query(None, description="Search by doctor's first or last name"),
        consultation_type: Optional[str] = Query(None,
                                                 description="Filter by consultation type: 'presentiel' or 'online'"),
        max_fee: Optional[float] = Query(None, description="Maximum consultation fee"),
        min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating (0-5)"),
        sort_by: Optional[str] = Query(None, description="Sort by: 'rating', 'price_asc', 'price_desc', 'experience'"),
        accepting_patients: bool = Query(True, description="Only show doctors accepting new patients"),
        limit: int = Query(20, le=100),
        offset: int = Query(0, ge=0),
        db: AsyncSession = Depends(get_db)
):
    """
    Search for doctors with filters and sorting.

    Public endpoint - anyone can search for doctors.
    Used by patients to find suitable doctors.

    Filters:
    - specialty: Search by medical specialty (e.g., "Cardiology")
    - city: Filter by city
    - doctor_name: Search by doctor's first or last name
    - consultation_type: "presentiel" or "online"
    - max_fee: Maximum consultation fee willing to pay
    - min_rating: Minimum doctor rating (0-5)
    - sort_by: Sort results by 'rating', 'price_asc', 'price_desc', 'experience'
    - accepting_patients: Only show doctors accepting new patients
    """
    doctors = await DoctorService.search_doctors(
        db=db,
        specialty=specialty,
        city=city,
        doctor_name=doctor_name,
        consultation_type=consultation_type,
        max_fee=max_fee,
        min_rating=min_rating,
        sort_by=sort_by,
        accepting_patients=accepting_patients,
        limit=limit,
        offset=offset
    )
    return doctors


@router.get("/list", response_model=List[DoctorPublicProfile])
async def list_all_doctors(
        limit: int = Query(50, le=100),
        offset: int = Query(0, ge=0),
        db: AsyncSession = Depends(get_db)
):
    """
    Get list of all doctors.

    Public endpoint - returns basic info about all doctors.
    """
    doctors = await DoctorService.get_all_doctors(db, limit=limit, offset=offset)
    return doctors


@router.get("/{doctor_id}", response_model=DoctorPublicProfile)
async def get_doctor_by_id(
        doctor_id: str,
        db: AsyncSession = Depends(get_db)
):
    """
    Get doctor profile by ID.

    Public endpoint - anyone can view a doctor's public profile.
    Used when patients want to see doctor details before booking.
    """
    from uuid import UUID

    try:
        doctor_uuid = UUID(doctor_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid doctor ID format"
        )

    doctor = await DoctorService.get_doctor_by_id(db, doctor_uuid)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    return doctor