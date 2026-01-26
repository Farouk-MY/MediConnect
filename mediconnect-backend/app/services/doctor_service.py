from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException, status
from typing import Optional, List
from uuid import UUID
from app.models.doctor import Doctor
from app.schemas.doctor import (
    DoctorUpdateRequest,
    ConsultationTypeConfigRequest
)


class DoctorService:

    @staticmethod
    async def get_doctor_by_user_id(db: AsyncSession, user_id: UUID) -> Optional[Doctor]:
        """Get doctor by user_id."""
        result = await db.execute(
            select(Doctor).where(Doctor.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_doctor_by_id(db: AsyncSession, doctor_id: UUID) -> Optional[Doctor]:
        """Get doctor by doctor_id."""
        result = await db.execute(
            select(Doctor).where(Doctor.id == doctor_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_doctor_profile(
            db: AsyncSession,
            user_id: UUID,
            data: DoctorUpdateRequest
    ) -> Doctor:
        """Update doctor profile (US006, US007, US008)."""

        # Get doctor
        doctor = await DoctorService.get_doctor_by_user_id(db, user_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        # Update fields
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if value is not None:
                # Convert Pydantic models to dicts for JSON fields
                if field in ['education', 'languages', 'payment_methods']:
                    if value:
                        value = [item.model_dump() if hasattr(item, 'model_dump') else item for item in value]
                setattr(doctor, field, value)

        await db.commit()
        await db.refresh(doctor)
        return doctor

    @staticmethod
    async def configure_consultation_types(
            db: AsyncSession,
            user_id: UUID,
            data: ConsultationTypeConfigRequest
    ) -> Doctor:
        """Configure consultation types and pricing (US008)."""

        doctor = await DoctorService.get_doctor_by_user_id(db, user_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found"
            )

        # Update consultation type settings
        doctor.offers_presentiel = data.offers_presentiel
        doctor.offers_online = data.offers_online

        # Update pricing if provided
        if data.consultation_fee_presentiel is not None:
            doctor.consultation_fee_presentiel = data.consultation_fee_presentiel
        if data.consultation_fee_online is not None:
            doctor.consultation_fee_online = data.consultation_fee_online

        await db.commit()
        await db.refresh(doctor)
        return doctor

    @staticmethod
    async def search_doctors(
            db: AsyncSession,
            specialty: Optional[str] = None,
            city: Optional[str] = None,
            doctor_name: Optional[str] = None,  # NEW: Search by name
            consultation_type: Optional[str] = None,  # 'presentiel' or 'online'
            max_fee: Optional[float] = None,
            accepting_patients: bool = True,
            limit: int = 20,
            offset: int = 0
    ) -> List[Doctor]:
        """
        Search doctors with filters.

        This will be used by patients to find doctors.
        """

        query = select(Doctor)

        # Filter by accepting patients
        if accepting_patients:
            query = query.where(Doctor.is_accepting_patients == True)

        # Filter by specialty
        if specialty:
            query = query.where(Doctor.specialty.ilike(f"%{specialty}%"))

        # Filter by city
        if city:
            query = query.where(Doctor.cabinet_city.ilike(f"%{city}%"))

        # NEW: Filter by doctor name (first name or last name)
        if doctor_name:
            query = query.where(
                or_(
                    Doctor.first_name.ilike(f"%{doctor_name}%"),
                    Doctor.last_name.ilike(f"%{doctor_name}%")
                )
            )

        # Filter by consultation type
        if consultation_type == 'presentiel':
            query = query.where(Doctor.offers_presentiel == True)
        elif consultation_type == 'online':
            query = query.where(Doctor.offers_online == True)

        # Filter by maximum fee
        if max_fee is not None:
            if consultation_type == 'presentiel':
                query = query.where(Doctor.consultation_fee_presentiel <= max_fee)
            elif consultation_type == 'online':
                query = query.where(Doctor.consultation_fee_online <= max_fee)
            else:
                # If no specific type, check if either fee is within budget
                query = query.where(
                    or_(
                        Doctor.consultation_fee_presentiel <= max_fee,
                        Doctor.consultation_fee_online <= max_fee
                    )
                )

        # Add pagination
        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_all_doctors(
            db: AsyncSession,
            limit: int = 50,
            offset: int = 0
    ) -> List[Doctor]:
        """Get all doctors (for admin or public listing)."""

        result = await db.execute(
            select(Doctor)
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()