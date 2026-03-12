import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DialogProvider } from "./ui/DialogProvider";
import SignInPage from "./pages/SignInPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import { lazy } from "react";
const SchoolList = lazy(() => import("./pages/Schools/SchoolList"));
const SchoolDetail = lazy(() => import("./pages/Schools/SchoolDetail"));
import InstitutionOnboarding from "./pages/School/InstitutionOnboarding";
import RetirementInbox from "./pages/Authority/RetirementInbox";
import RetirementApproval from "./pages/Authority/RetirementApproval";

import TeacherLectures from "./pages/Teacher/TeacherLectures";
import MarkAttendance from "./pages/Teacher/MarkAttendance";
import { RequireRole } from "./RBAC/RequireRole";
import PrincipalStaffing from "./pages/Principal/PrincipalStaffing";
import AcademicView from "./pages/Principal/AcademicView";
import AttendanceView from "./pages/Principal/AttendanceView";
import MarkAttendancePrincipal from "./pages/Principal/MarkAttendancePrincipal";
import LeaveReview from "./pages/Principal/LeaveReview";
import PendingRegistrations from "./pages/Principal/PendingRegistrations";
import AuditLogsView from "./pages/Principal/AuditLogsView";
import SubRoles from "./pages/Principal/SubRoles";
import StructureView from "./pages/Principal/StructureView";
import RoleManagement from "./pages/RoleManagement";
import ClassesRegistry from "./pages/ClassesRegistry";
import ClassCreate from "./pages/Classes/ClassCreate";
import ClassDetail from "./pages/ClassDetail";
import DepartmentDetail from "./pages/DepartmentDetail";
import DepartmentClasses from "./pages/DepartmentClasses";
import TeachersList from "./pages/TeachersList";
import TeacherCreate from "./pages/Teachers/TeacherCreate";
import TeacherDetail from "./pages/TeacherDetail";
import StudentList from "./pages/StudentList";
import StudentCreate from "./pages/Students/StudentCreate";
import StudentDetail from "./pages/StudentDetail";
import Unauthorized from "./pages/Unauthorized";
import HODDashboard from "./pages/HOD/HODDashboard";
import TeacherScheduling from "./pages/TeacherScheduling";

import DashboardRoute from "./pages/DashboardRoute";
import SettingsLayout from "./components/Settings/SettingsLayout";
import InstituteSettings from "./pages/Settings/InstituteSettings";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardRoute />} />
              {/* Principal Dashboard */}
              <Route path="principal" element={<RequireRole role={["PRINCIPAL", "UNIVERSITY_PRINCIPAL", "COLLEGE_PRINCIPAL", "SCHOOL_PRINCIPAL"]} redirectTo="/signin" />}>
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="staffing" element={<PrincipalStaffing />} />
                <Route path="academic" element={<AcademicView />} />
                <Route path="attendance" element={<AttendanceView />} />
                <Route path="attendance/mark/:slotId" element={<MarkAttendancePrincipal />} />
                <Route path="leaves" element={<LeaveReview />} />
                <Route path="registrations" element={<PendingRegistrations />} />
                <Route path="audit" element={<AuditLogsView />} />
                <Route path="sub-roles" element={<SubRoles />} />
                <Route path="structure" element={<StructureView />} />
                <Route path="schools/:schoolId" element={<SchoolDetail />} />
                <Route path="teacher-schedule" element={<TeacherScheduling />} />
              </Route>

              {/* HOD Dashboard - Separate Route */}
              <Route path="hod" element={<RequireRole role="HOD" redirectTo="/signin" />}>
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="schedule" element={<HODDashboard />} />
                <Route path="teacher-schedule" element={<TeacherScheduling />} />
              </Route>

              {/* Admin Home / Default Dashboard */}
              <Route path="home" element={<Navigate to="/" replace />} />

              <Route element={<RequireRole role={["MAIN_AUTHORITY"]} />}>
                <Route path="schools" element={<SchoolList />} />
                <Route path="schools/new" element={<InstitutionOnboarding />} />
                <Route path="schools/:schoolId" element={<SchoolDetail />} />
              </Route>

              {/* Department Detail - Accessible by both Authorities and Principals */}
              <Route element={<RequireRole role={["MAIN_AUTHORITY", "PRINCIPAL", "UNIVERSITY_PRINCIPAL", "COLLEGE_PRINCIPAL", "SCHOOL_PRINCIPAL"]} />}>
                <Route path="departments/:deptId" element={<DepartmentDetail />} />
              </Route>

              <Route element={<RequireRole role="MAIN_AUTHORITY" />}>
                <Route path="authority/inbox" element={<RetirementInbox />} />
                <Route path="authority/retirement/:requestId" element={<RetirementApproval />} />
              </Route>

              {/* Module 4: Custom Roles */}
              <Route element={<RequireRole role={["MAIN_AUTHORITY", "PRINCIPAL", "UNIVERSITY_PRINCIPAL", "COLLEGE_PRINCIPAL", "SCHOOL_PRINCIPAL"]} />}>
                <Route path="roles" element={<RoleManagement />} />
              </Route>

              {/* Module 5: Classes & Teachers */}
              <Route path="classes" element={<ClassesRegistry />} />
              <Route path="classes/new" element={<ClassCreate />} />
              <Route path="classes/detail/:id" element={<ClassDetail />} />
              <Route path="classes/detail/:classId/students/:id" element={<StudentDetail />} />
              <Route path="classes/department/:deptId" element={<DepartmentClasses />} />
              <Route path="teachers" element={<TeachersList />} />
              <Route path="teachers/new" element={<TeacherCreate />} />
              <Route path="teachers/:id" element={<TeacherDetail />} />

              {/* Module 6: Students - Restricted to Principal and HOD */}
              <Route element={<RequireRole role={["PRINCIPAL", "UNIVERSITY_PRINCIPAL", "COLLEGE_PRINCIPAL", "SCHOOL_PRINCIPAL", "HOD"]} />}>
                <Route path="students" element={<StudentList />} />
                <Route path="students/new" element={<StudentCreate />} />
                <Route path="students/:id" element={<StudentDetail />} />
              </Route>

              {/* Module 7: Teacher Dashboard */}
              <Route element={<RequireRole role="TEACHER" />}>
                <Route path="teacher/dashboard" element={<Navigate to="/" replace />} />
                <Route path="teacher/lectures" element={<TeacherLectures />} />
                <Route path="teacher/attendance/mark/:slotId" element={<MarkAttendance />} />
                <Route path="teacher/attendance/mark/:slotId" element={<MarkAttendance />} />
              </Route>

              {/* Module 8: Settings (Principal Only) */}
              <Route path="settings" element={<RequireRole role={["PRINCIPAL", "UNIVERSITY_PRINCIPAL", "COLLEGE_PRINCIPAL", "SCHOOL_PRINCIPAL"]} />}>
                <Route element={<SettingsLayout />}>
                  <Route path="institute" element={<InstituteSettings />} />
                  {/* Default redirect */}
                  <Route index element={<Navigate to="institute" replace />} />
                </Route>
              </Route>

              {/* Notifications */}
              <Route path="notifications" element={<NotificationsPage />} />

            </Route>

          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" />
      </DialogProvider>
    </QueryClientProvider >
  );
}
