# University Web Portal - Implementation Overview

## Module 1B: Principal Retirement & Succession Workflow
*(Previously implemented)*
- **Features**: Request retirement, Authority review, Internal promotion vs External search.
- **Security**: Protected routes for Authority, sidebar visibility hardening.

## Module 2: University Departmental Hierarchy
This module introduces staffing and academic management for Higher Education institutions.

### 1. Principal: Departmental Staffing
- **Department Creation**: Principal can create departments with specific building locations.
- **HOD Assignment**: Assign faculty members as Head of Department.
  - **Constraint**: Each department can have only one HOD.
  - **Constraint**: A teacher cannot be HOD of multiple departments.
  - **RBAC**: Assigned teachers are implicitly granted the [HOD](file:///d:/Work/src/services/hierarchyService.ts#44-89) role.

### 2. HOD: Academic Execution
- **Class Management**: Create specific classes/sections (e.g., "BSCS-Semester 4-A").
- **Course Catalog**: Manage subjects within the department.
- **Lecture Scheduling**: Map teachers to subjects and time slots.
  - **Conflict Detection**: Prevents scheduling a teacher for two different sessions at the same time slot across all classes.

### 3. Data Persistence (LocalStorage)
- **Schema**: `departments`, `classes`, `subjects`, `schedules`, and `teachers`.
- **Integrity**: Constraints are enforced at the repository/service level to ensure data validity even if UI checks are bypassed.

## Navigation
- **Principal Staffing**: Accessible via the sidebar when the role is "PRINCIPAL".
- **Academic Schedule**: Accessible via the sidebar when the role is "HOD".

## UI & UX Polish
- **Premium Dialog Component**: Implemented smooth `animate-in` transitions (700ms), backdrop blurs, and consistent typography for:
    - Principal Staffing (HOD Assignment)
    - HOD Dashboard (Class Creation, Lecture Scheduling)
- **Strict Validation**: Enforced strict uniqueness checks for EMIS code directly within the LocalStorage repository layer to prevent duplicate institution creation.

## How to Add an Institution
1.  Navigate to the **Schools** page (accessible via sidebar "Schools" icon).
2.  Click the **"Onboard new school"** button.
3.  Fill in the required details:
    - **EMIS Code**: Must be unique (e.g., "EMIS-9999").
    - **Vertical Type**: Select University, College, or K-12.
    - **Dynamic Fields**: Count (University) or Grade Range (K-12).
