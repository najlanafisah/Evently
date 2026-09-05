# PRD — Event Management SaaS

## 1. Product Overview
A web-based event management application for administrators to create and manage events, register participants, monitor attendance, and review participant data.

## 2. Goals
- Centralize event operations in one dashboard.
- Reduce manual registration and attendance work.
- Provide clear operational data and status visibility.
- Deliver a responsive, modern, futuristic SaaS interface.

## 3. Target Users
- Event administrator
- Event operator
- Registration staff
- Attendance staff

## 4. Core Modules
### 4.1 Dashboard
- Total events
- Upcoming events
- Total registrants
- Attendance summary
- Recent activity

### 4.2 Data Event
- Event list in table/card view
- Search, filter, and sort
- Create, view, edit, archive event
- Event status: Draft, Published, Ongoing, Completed, Archived
- Event detail with schedule, location, quota, and registration status

### 4.3 Pendaftaran
- Public registration form
- Event selection
- Participant identity and contact fields
- Registration confirmation
- Registration status tracking

### 4.4 Data Pendaftar
- Participant list
- Search and filter by event/status
- Participant detail
- Registration status: Pending, Confirmed, Cancelled
- Export participant data

### 4.5 Presensi
- Attendance list per event
- Check-in action
- Check-in time and attendance status
- Attendance summary
- Status: Belum Hadir, Hadir, Terlambat

## 5. Functional Requirements
- Users can navigate between all core modules.
- Admins can create and update event data.
- Users can register for a published event.
- Operators can validate participant attendance.
- The system displays empty, loading, success, and error states.
- Tables support responsive behavior.
- Forms provide validation and clear feedback.

## 6. Non-Functional Requirements
- Front-end only in the initial implementation.
- Technology: HTML, CSS, JavaScript.
- Responsive from mobile to desktop.
- Accessible keyboard navigation and readable contrast.
- No unnecessary dependencies.
- Component naming and data structure must remain consistent with this SOT.

## 7. Out of Scope
- Backend API
- Authentication implementation
- Payment gateway
- Real email or WhatsApp delivery
- Production deployment
- Database integration

## 8. Success Criteria
- Core modules are reachable and understandable.
- Main workflows can be demonstrated with mock data.
- UI is responsive and visually consistent.
- All implementation decisions trace back to this PRD and UI-GUIDELINE.
