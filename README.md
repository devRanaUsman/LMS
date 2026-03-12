# Ticketly Web Portal (Frontend)

This is the frontend repository for the Ticketly Web Portal. It has been modernized to use a robust, scalable stack suitable for production integration.

## 🛠 Tech Stack

- **Framework**: React + Vite + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Architecture**: [Shadcn UI](https://ui.shadcn.com/) pattern (Reusable components in `components/ui`)
- **State Management**: [Tanstack Query (React Query)](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Networking**: [Axios](https://axios-http.com/)

## 📂 Project Structure

```bash
src/
├── components/
│   ├── ui/               # Reusable atomic components (Button, Input, etc.)
│   ├── Sigin/            # Feature-specific components (SignInForm)
├── hooks/                # Custom hooks (e.g., useSignInForm - legacy/refactored)
├── lib/
│   └── utils.ts          # Utility for merging Tailwind classes (cn)
├── pages/                # Page views (SignInPage, Home)
├── services/             # API service layer (authService)
└── App.tsx               # Main entry with QueryClientProvider
```

## 🚀 Key Features

### 1. Minimal Login Redesign
The login page (`SignInForm.tsx`) features a split-screen layout:
- **Left Panel**: Gradient branding (`slate-900` to `blue-900`) with a dark glassmorphism logo.
- **Right Panel**: A clean form with "Shutter" animations (smooth height/opacity transitions) using Framer Motion.

### 2. State Management (React Query)
We use `useMutation` for handling form submissions. This handles `isLoading` and `error` states automatically.

```tsx
// Example usage in component
const signInMutation = useMutation({
  mutationFn: signIn, // function that calls the API
  onSuccess: () => navigate("/home"),
  onError: () => setErrorBanner("Failed"),
});
```

### 3. Tailwind v4 Configuration
- We use `@import "tailwindcss";` in `src/index.css`.
- PostCSS is configured via `@tailwindcss/postcss`.

## 🔌 Backend Integration Guide

**For the Backend Developer:**

The frontend currently uses a mock/local implementation for authentication. To connect this to the real backend, follow these steps:

### 1. Update `src/services/authService.ts`

Currently, `signIn` and `signUp` might just simulate a delay or look at LocalStorage. functionality. You need to replace this with real Axios calls.

**Current (Mock):**
```ts
export const signIn = async (data: SignInData) => {
  // Simulates delay
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  // ... local logic
};
```

**Future (Real API):**
```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const signIn = async (data: SignInData) => {
  const response = await api.post('/auth/login', data);
  // Save JWT token, etc.
  localStorage.setItem('token', response.data.token); 
  return response.data;
};
```

### 2. Form Data Contracts

The `SignInForm.tsx` sends the following data structures:

**Sign In Payload:**
```json
{
  "phone": "03XXXXXXXXX",
  "password": "user_password"
}
```

**Sign Up Payload:**
```json
{
  "name": "Full Name",
  "phone": "03XXXXXXXXX",
  "password": "user_password"
}
```

Ensure your backend API endpoints match these payloads or update the `services/authService.ts` to transform the data before sending.


## 🔗 Backend Integration Guide

**Attention Backend Developers:** This section details the current mock implementations and where to integrate real API calls.

### 1. Authentication
- **File**: [`src/components/Sigin/SignInForm.tsx`](src/components/Sigin/SignInForm.tsx)
- **Current Logic**: 
  - The `handleLogin` function uses hardcoded checks against `localStorage` or dummy credentials.
  - It simulates a login delay.
- **Integration Action**:
  - Replace the simulated check with a real `POST` request to your Auth API (e.g., `/api/auth/login`).
  - Store the returned JWT/Auth token in secure storage (cookie or local storage depending on security requirements).
  - Update any user context or global state with the logged-in user's profile.

### 2. Schools Management
- **Primary Files**: 
  - List: [`src/pages/School/SchoolList.tsx`](src/pages/School/SchoolList.tsx)
  - Details: [`src/pages/School/SchoolDetails.tsx`](src/pages/School/SchoolDetails.tsx)

#### A. School List (`/schools`)
- **Integration Action**: Update `fetchSchools` to call `GET /api/schools`.
- **Query Parameters**:
  - `page`: number (default 1)
  - `pageSize`: number (default 30)
  - `search`: string
  - `searchType`: "Name" | "ID"
  - `vertical`: "All" | "School" | "College" | "University"
  - `status`: "All" | "Active" | "Inactive" | "Pending Assignment"
- **Mock Logic**: currently uses `setTimeout` and filters `DUMMY_SCHOOLS`.
- **Note on "Pending Assignment"**: This status applies when `principal` is null/empty.

#### B. School Details (`/schools/:id`)
- **Integration Action**: Update `mockFetchSchool` to call `GET /api/schools/:id`.
- **Mock Logic**:
  - The current mock derives the Vertical (School vs College) from the ID pattern (e.g., `1000`->School, `1001`->College) to enable testing.
  - **Backend Requirement**: The API must return the `vertical` field explicitly so the frontend can render the correct section (K-12 vs Higher Ed).

**Expected Data Schema (SchoolDetails):**
```ts
interface SchoolDetails {
    id: string;
    name: string;
    emisCode: string;
    registrationDate: string; // ISO Date YYYY-MM-DD
    vertical: "School" | "College" | "University";
    status: "Active" | "Inactive";
    medium?: "English" | "Urdu" | "Sindhi"; // K-12 specific
    address: {
        district: string;
        tehsil: string;
        coords: { lat: number; lng: number };
    };
    principal?: { // Optional (if null, Identity card shows "Draft/Pending")
        id: string;
        name: string;
        cnic: string;
        email: string;
        photoUrl?: string;
    };
    subAuthority: { name: string; role: string }[];
    globalPolicies: string[];
    // Higher Ed Specific
    departments?: { name: string; hod: string; hodEmail?: string }[];
    semester?: { name: string; start: string; end: string; creditHours: number };
    // K-12 Specific
    grades?: { name: string; sections: string[] }[];
}
```

### 3. Safepay Reports
- **File**: [`src/pages/Reports/SafepayReport.tsx`](src/pages/Reports/SafepayReport.tsx)
- **Current Logic**:
  - Uses mock transaction data similar to the Schools list.
- **Integration Action**:
  - Connect to the Reporting API endpoint.
  - Ensure the API response matches the expected transaction format for the `DataTable`.

### 4. Role-Based Access Control (RBAC)
- **Files**: 
  - [`src/RBAC/roles.ts`](src/RBAC/roles.ts) (Definitions)
  - [`src/RBAC/canMethod.ts`](src/RBAC/canMethod.ts) (Hooks)

#### Integration Action
- The frontend assumes the user object (in `localStorage` or Context) has a `role` field matching one of `keyof ROLE_PERMISSIONS`.
- **Strict Role Enforcement**:
  - Some UI elements (e.g., "Assign HOD", "Manage Sections") are restricted **strictly** to the `PRINCIPAL` role.
  - We use the hook `useCurrentRole()` to check `role === 'PRINCIPAL'`.
  - **Backend Note**: Even if a user has "Super Admin" permissions, business logic dictates they cannot perform Principal-specific tasks (like assigning an HOD). Ensure your backend endpoints enforce this separation of duties.

---

## 📂 Project Structure

- **`src/pages`**: Application views (Dashboard, School List, Reports).
- **`src/components`**: Reusable UI components.
  - **`ui/DataTable`**: The core table component used for listings.
  - **`ui/Filters`**: Search, Select, and Date Range filter components.
- **`src/RBAC`**: Logic for Role-Based Access Control (Permissions, Guard components).

## 💡 Notes for Developers

- **Loader**: A global `Loader` component is available and can be used while `isLoading` states are true during API fetches.
- **Toast Notifications**: Use `react-toastify` for success/error messages after API actions (e.g., "School added successfully", "Failed to login").


## 🏃‍♂️ Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

---

## 🎯 Principal Dashboard (Latest Updates - Jan 29, 2026)

The Principal Dashboard is a comprehensive management interface with role-based features for University, College, and K-12 institutions.

### Key Features

#### 1. **Context-Aware UI**
The dashboard adapts based on the institution's vertical:
- **University/College**: Shows departments, HOD management, credit hour tracking
- **K-12 (School)**: Shows grades, sections, head teacher management

**Implementation**:
```tsx
// File: src/pages/PrincipalDashboard/PrincipalDashboard.tsx
const [institutionType, setInstitutionType] = useState<"UNIVERSITY" | "COLLEGE" | "SCHOOL">("UNIVERSITY");

// Conditional rendering example
{institutionType === "SCHOOL" ? (
  <GradeSectionManager />
) : (
  <DepartmentManager />
)}
```

#### 2. **KPI Dashboard**
Real-time metrics with conditional styling:
- **Student Presence**: Shows present/total with percentage
- **Teacher Attendance**: Check-in status
- **Pending Actions**: Leaves + registrations count
- **Schedule Health**: Coverage percentage with threshold-based icon (< 70% shows warning)

**Backend Integration**:
```ts
// Endpoint: GET /api/principal/stats
interface DashboardStats {
  studentPresence: { present: number; total: number };
  teacherAttendance: { checkedIn: number; total: number };
  pendingActions: { leaves: number; registrations: number };
  scheduleHealth: { coveredSessions: number; plannedSessions: number };
}
```

#### 3. **Schedule Matrix**
Interactive schedule management with proxy assignment:
- Date and context (Department/Grade) selection
- Real-time schedule display
- Proxy teacher assignment with search
- **Mobile responsive** with horizontal scroll

**Backend Integration**:
```ts
// Endpoint: GET /api/schedule?contextId={id}&date={YYYY-MM-DD}&institutionType={type}
// Returns different subjects based on institutionType:
// - SCHOOL: ["Mathematics", "English", "Urdu", "General Science", ...]
// - UNIVERSITY: ["Calculus I", "Linear Algebra", "Discrete Math", ...]

interface ScheduleSlot {
  id: number;
  time: string;
  subject: string;
  teacherId: number;
  teacherName: string;
  proxyTeacherId?: number;
  proxyTeacherName?: string;
  isProxyToday?: boolean;
}

// Endpoint: POST /api/schedule/proxy
// Body: { slotId: number, teacherId: number, date: string }
// IMPORTANT: Must create audit log entry (see Audit Logs section)
```

#### 4. **Sub-Role Management**
Manage HODs (University) or Head Teachers (K-12):
- Dynamic context labels based on vertical
- Create and assign roles
- Context-aware form fields

**Backend Integration**:
```ts
// Endpoint: GET /api/sub-users
interface SubUser {
  id: number;
  name: string;
  email: string;
  role: 'HOD' | 'Clerk';
  status: 'Active' | 'Inactive';
  context?: string; // "Computer Science" for University, "Grade 10" for K-12
}

// Endpoint: POST /api/sub-users
// Body: { name, email, role, context }
```

#### 5. **Audit Logs**
Security audit trail for critical actions:
- Attendance overrides
- Proxy assignments
- School closures

**Backend Integration**:
```ts
// Endpoint: GET /api/audit-logs
interface AuditLog {
  id: number;
  timestamp: string; // ISO 8601
  principalId: number;
  action: "ATTENDANCE_OVERRIDE" | "PROXY_ASSIGNMENT" | "SCHOOL_CLOSURE";
  entityId: number;
  reason: string;
  description: string;
}

// CRITICAL: Proxy assignments MUST create audit log entries automatically
// Example: When POST /api/schedule/proxy is called, backend should:
// 1. Create proxy assignment
// 2. Create audit log entry with action="PROXY_ASSIGNMENT"
// 3. Return success
```

#### 6. **Emergency Controls**
School closure and broadcast system with safety guardrails:
- **School Closure**: Toggle with reason requirement
- **Emergency Broadcast**: **Disabled unless school is closed** (safety feature)

**Backend Integration**:
```ts
// Endpoint: GET /api/school/status
interface SchoolStatus {
  status: 'Open' | 'Closed';
  reason?: string;
}

// Endpoint: POST /api/school/toggle-status
// Body: { status: 'Open' | 'Closed', reason?: string }
// IMPORTANT: Creates audit log if closing

// Endpoint: POST /api/broadcast
// Body: { message: string, audiences: string[] }
// IMPORTANT: Frontend only allows this when school status is 'Closed'
```

#### 7. **Leave Verification**
Approve/reject student and teacher leave requests:

**Backend Integration**:
```ts
// Endpoint: GET /api/leaves
interface LeaveRequest {
  id: number;
  type: 'Student' | 'Teacher';
  name: string;
  details: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Endpoint: POST /api/leaves/{id}/process
// Body: { status: 'Approved' | 'Rejected' }
// IMPORTANT: Approved student leaves affect KPI calculations
// (see studentPresence calculation in stats endpoint)
```

#### 8. **Grade/Department Management**

**For K-12 (Grades)**:
```ts
// Endpoint: GET /api/grades
interface Grade {
  id: number;
  name: string; // "Grade 9", "Grade 10"
  sectionsCount: number;
  headTeacher?: string;
}

// Endpoint: POST /api/grades
// Body: { name: string }

// Endpoint: POST /api/grades/{id}/assign-head-teacher
// Body: { teacherId: number }
```

**For University (Departments)**:
```ts
// Endpoint: GET /api/departments
interface Department {
  id: number;
  name: string;
  hodName: string;
  hodId?: number;
  totalClasses: number;
  status: "Active" | "Inactive";
}

// Endpoint: POST /api/departments/{id}/assign-hod
// Body: { teacherId: number }
```

#### 9. **Credit Hour Tracking** (University/College Only)
**Frontend Guard**: Component does NOT mount for K-12 institutions.

**Backend Integration**:
```ts
// Endpoint: GET /api/credit-stats
interface CreditStat {
  id: number;
  courseName: string;
  plannedHours: number;
  deliveredHours: number;
}
```

### Important Frontend Logic for Backend Developers

#### A. Vertical-Based Rendering
The frontend uses helper functions to determine UI:
```ts
// File: src/utils/schoolHelpers.ts
export const isK12 = (vertical: string) => vertical === "School";
export const isUniversityLike = (vertical: string) => 
  vertical === "University" || vertical === "College";
```

**Backend Requirement**: Always return the `vertical` field in school/institution responses.

#### B. Component Guards
Some components have strict mounting guards:
- `CreditHourTracker`: Only mounts for University/College
- `GradeSectionManager`: Only for K-12
- `DepartmentManager`: Only for University/College

**Backend Requirement**: Ensure endpoints return appropriate data based on vertical.

#### C. Audit Log Creation
**CRITICAL**: The following actions MUST create audit logs:
1. Proxy assignment (`POST /api/schedule/proxy`)
2. Attendance override for locked records
3. School closure (`POST /api/school/toggle-status` when closing)

The frontend expects these logs to appear immediately in the audit log list.

#### D. Mobile Responsiveness
The Schedule Matrix uses responsive design:
- Desktop: Full table view
- Mobile/Tablet: Horizontal scroll, stacked controls
- All functionality remains accessible

**Backend Requirement**: No special handling needed, but ensure API responses are lightweight for mobile.

---

## 📍 School Location Map

The School Details page now includes an **embedded Google Maps iframe** showing the school location.

**Implementation**:
```tsx
// File: src/pages/School/SchoolDetails.tsx
<iframe
  src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
  width="100%"
  height="300"
  style={{ border: 0, borderRadius: '0.5rem' }}
  allowFullScreen
  loading="lazy"
/>
```

**Backend Requirement**: Ensure `address.coords.lat` and `address.coords.lng` are valid numbers in the school details response.

---

## 🧪 Testing

### Test Files
- `src/tests/CreditHourTracking.test.tsx`: Verifies component guards
- `src/tests/DashboardFixes.test.tsx`: Comprehensive dashboard feature tests

### Running Tests
```bash
npm test
```

**Coverage**:
- K-12 schedule subject verification
- Credit hour component mounting guards
- Proxy assignment audit logging
- Emergency broadcast guardrails
- Schedule health icon thresholds

---

## 🔐 Security Considerations

1. **Audit Logs**: All critical actions are logged with principal ID and timestamp
2. **Emergency Broadcast**: Disabled unless school closure is active (prevents accidental panic broadcasts)
3. **Locked Attendance**: Requires reason + creates audit log for overrides
4. **Role-Based Access**: Principal-specific actions are strictly guarded

**Backend Requirement**: Implement corresponding server-side validations for all these guardrails.

---

## 📊 Data Flow Summary

```
User Action → Frontend Component → Service Layer → Backend API
                                                         ↓
                                                    Database
                                                         ↓
                                                    Response
                                                         ↓
Frontend State Update (React Query) → UI Refresh
```

**React Query** handles:
- Automatic refetching
- Cache invalidation
- Loading states
- Error handling

**Backend Requirement**: Return consistent response formats and appropriate HTTP status codes.

#   L M S  
 