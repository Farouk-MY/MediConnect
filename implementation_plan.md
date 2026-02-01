# MediConnect Sprint 3 & 4 Implementation Plan
## Recherche et Rendez-vous (Search & Appointments) Epic

> **Goal**: Build a complete doctor discovery and appointment booking system with interactive map, advanced search, and full appointment lifecycle management.

![Sprint Requirements](file:///C:/Users/MSI/.gemini/antigravity/brain/c23709a8-274b-448c-be89-574f760a0b9b/uploaded_media_1769713197164.png)

---

## User Review Required

> [!IMPORTANT]
> **Maps Library Choice**: I recommend using `react-native-maps` for the interactive doctor map. This requires EAS Build for native map rendering. If you prefer to avoid native builds, I can use a WebView-based map solution instead.

> [!WARNING]  
> **Breaking Change**: The Appointment model will add new database tables requiring Alembic migration.

---

## Proposed Changes

### Backend - Appointment System

#### [NEW] [appointment.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/models/appointment.py)
Create full Appointment model with:
- Patient/Doctor relationship IDs
- Appointment datetime, duration
- Consultation type (presentiel/online)
- Status enum: pending, confirmed, cancelled, completed, no_show
- Cancellation reason, cancelled_by, cancelled_at
- Notes, video call link (for online)
- Price snapshot

---

#### [NEW] [appointment.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/schemas/appointment.py)
Create Pydantic schemas:
- `AppointmentCreateRequest` - booking payload
- `AppointmentUpdateRequest` - reschedule payload
- `AppointmentResponse` - full appointment details
- `AppointmentListResponse` - paginated list
- `TimeSlot` - available slot representation

---

#### [NEW] [appointment_service.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/services/appointment_service.py)
Full service with:
- `create_appointment()` - book with availability check
- `get_patient_appointments()` - patient's appointments
- `get_doctor_appointments()` - doctor's schedule
- `cancel_appointment()` - with 24h rule enforcement
- `reschedule_appointment()` - change date/time
- `get_available_slots()` - compute free time slots
- `mark_completed()` / `mark_no_show()` - status updates

---

#### [MODIFY] [appointments.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/api/v1/appointments.py)
Implement full REST API:
```
POST   /appointments        - Create booking
GET    /appointments/me     - My appointments (patient)
GET    /appointments/doctor - Doctor's calendar
GET    /appointments/{id}   - Get details
PUT    /appointments/{id}   - Reschedule
DELETE /appointments/{id}   - Cancel
GET    /doctors/{id}/availability - Available slots
```

---

#### [MODIFY] [doctors.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/api/v1/doctors.py)
Add:
- Sorting options (rating, price, distance)
- Min/max rating filter
- New endpoint: `GET /doctors/{id}/reviews` (for future)

---

#### [MODIFY] [main.py](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-backend/app/main.py)
Register appointments router

---

### Frontend - Doctor Search & Map (US009/US010)

#### [NEW] [index.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/app/%28patient%29/doctors/index.tsx)
Doctor Search screen with:
- Search bar with filter button
- Filter modal: specialty, city, type, price, rating
- Toggle between List/Map view
- Premium doctor cards with glassmorphism design

---

#### [NEW] [DoctorMapView.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/patient/DoctorMapView.tsx)
Interactive map component:
- Uses `react-native-maps` with custom markers
- Doctor popup on marker tap
- Cluster markers for dense areas
- User location button

---

#### [MODIFY] [[id].tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/app/%28patient%29/doctors/[id].tsx)
Doctor Profile page with:
- Header with avatar, name, specialty
- Stats row (rating, experience, patients)
- About section with bio
- Consultation types + pricing cards
- Location map with "Get Directions"
- Working hours
- "Book Appointment" floating button

---

#### [NEW] [DoctorCard.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/patient/DoctorCard.tsx)
Reusable search result card

---

#### [NEW] [RatingStars.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/ui/RatingStars.tsx)
Star rating display component

---

### Frontend - Booking Flow (US011)

#### [MODIFY] [[doctorId].tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/app/%28patient%29/booking/[doctorId].tsx)
Multi-step booking flow:
1. Select consultation type (online/presentiel)
2. Pick date with availability calendar
3. Pick time slot
4. Review & confirm (summary + price)
5. Success screen with confirmation code

---

#### [NEW] [TimeSlotPicker.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/patient/TimeSlotPicker.tsx)
Time slot selection grid

---

#### [NEW] [CalendarPicker.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/patient/CalendarPicker.tsx)
Month calendar with availability dots

---

### Frontend - Appointment Management (US012)

#### [MODIFY] [appointments.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/app/%28patient%29/(tabs)/appointments.tsx)
My Appointments tab:
- Upcoming appointments section
- Past appointments section
- Status badges
- Pull to refresh

---

#### [NEW] [[appointmentId].tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/app/%28patient%29/consultation/[appointmentId].tsx)
Appointment detail screen:
- Doctor info
- DateTime + type
- Cancel/Reschedule buttons (24h check)
- Video call button (if online + confirmed)

---

#### [NEW] [AppointmentCard.tsx](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/components/patient/AppointmentCard.tsx)
Appointment card for list view

---

### Frontend - API Integration

#### [MODIFY] [appointments.ts](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/lib/api/appointments.ts)
Full appointments API client:
- `createAppointment()`
- `getMyAppointments()`
- `getAppointmentById()`
- `cancelAppointment()`
- `rescheduleAppointment()`
- `getDoctorAvailability()`

---

#### [MODIFY] [doctors.ts](file:///c:/Users/MSI/Desktop/DEV/MediConnect/mediconnect-mobile/lib/api/doctors.ts)
Add:
- `searchDoctors()` - with all filters
- `getDoctorById()` - public profile
- `listDoctors()` - all doctors for map

---

### Database Migration

#### [NEW] Alembic migration
```bash
alembic revision --autogenerate -m "Add appointments table"
alembic upgrade head
```

---

## Verification Plan

### Backend Tests

I will create tests in `tests/api/test_appointments.py`:

```bash
# Run from mediconnect-backend directory
pytest tests/api/test_appointments.py -v
```

Test cases:
1. Create appointment - success
2. Create appointment - time slot conflict (409)
3. Cancel within 24h - blocked (400)
4. Cancel after 24h - success
5. Reschedule with valid slot - success
6. Get patient appointments - returns list
7. Get doctor availability - returns free slots

### Mobile Manual Testing

> [!NOTE]
> Please help verify these flows on device/simulator after implementation:

1. **Doctor Search**:
   - Open Home → tap search bar
   - Apply filters (specialty, type, price)
   - Verify results update
   - Toggle to Map view → see markers

2. **Doctor Profile**:
   - Tap doctor card → see full profile
   - Verify all sections render
   - Tap "Book Appointment"

3. **Booking Flow**:
   - Select consultation type
   - Pick available date
   - Pick time slot
   - Confirm → see success

4. **My Appointments**:
   - Go to Appointments tab
   - See booked appointment
   - Tap → view details
   - Test cancel (should show 24h warning if applicable)
