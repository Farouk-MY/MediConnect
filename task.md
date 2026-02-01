# MediConnect Sprint 3 & 4 Implementation

## Sprint Overview
Implementing the "Recherche et Rendez-vous" (Search & Appointments) Epic with advanced doctor search, interactive map, booking system, and appointment management.

---

## Sprint 3: Doctor Search & Discovery

### US009: Doctor Search with Filters (8 pts)
- [x] **Backend**: Enhance search API with rating filter and sorting
- [ ] **Frontend**: Advanced search screen with all filters
- [ ] **Frontend**: Interactive map with doctor locations (react-native-maps)
- [ ] **Frontend**: Search results list with premium card design

### US010: Doctor Profile View (3 pts)
- [ ] **Frontend**: Detailed doctor profile page
  - Doctor info, bio, photos, experience
  - Consultation types and pricing
  - Ratings and reviews section
  - Location map with directions
  - Working hours / availability calendar
  - "Book Appointment" CTA

---

## Sprint 4: Booking & Appointment Management

### US011: Appointment Booking (13 pts)
- [x] **Backend**: Create Appointment model with full schema
- [x] **Backend**: Create AppointmentService with booking logic
- [x] **Backend**: Create Appointments API (CRUD + availability check)
- [x] **Backend**: Add doctor availability/schedule support
- [ ] **Frontend**: Booking flow screen
  - Select consultation type (in-person/online)
  - Pick date from available slots
  - Pick time slot
  - Confirm booking with summary + pricing
- [ ] **Frontend**: Booking confirmation screen
- [x] **Backend**: Real-time notifications (patient + doctor)

### US012: Appointment Cancellation/Modification (5 pts)
- [x] **Backend**: Cancel/reschedule endpoints with 24h rule
- [x] **Backend**: Notify doctor on changes
- [ ] **Frontend**: My Appointments screen (list + details)
- [ ] **Frontend**: Cancel/reschedule UI with confirmation
- [ ] **Frontend**: Appointment history view

---

## Shared Components Needed
- [ ] Interactive map component with markers
- [ ] Time slot picker component
- [ ] Star rating display component
- [ ] Appointment status badge component
- [ ] Doctor card (search result) component
