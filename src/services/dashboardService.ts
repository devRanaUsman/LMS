

export interface DashboardStats {
    studentPresence: {
        present: number;
        total: number;
    };
    teacherAttendance: {
        checkedIn: number;
        total: number;
    };
    pendingActions: {
        leaves: number;
        registrations: number;
    };
    scheduleHealth: {
        coveredSessions: number;
        plannedSessions: number;
    };
}

import { localStorageRepository } from "./localStorageRepository";
import { hierarchyService } from "./hierarchyService";
import { type Class } from "../types/hierarchy";

export interface Department {
    id: number | string;
    name: string;
    hodName: string;
    hodId?: number;
    totalClasses: number;
    status: "Active" | "Inactive";
}

export interface Grade {
    id: number;
    name: string; // "Grade 10"
    sectionsCount: number;
    headTeacher?: string; // Optional equivalent to HOD
}

export interface Section {
    id: number;
    name: string; // "A"
    gradeId: number;
    totalStudents: number;
}

export interface TeacherMock {
    id: number;
    name: string;
    email: string;
}

export interface ScheduleSlot {
    id: number;
    time: string;
    subject: string;
    teacherId: number | string;
    teacherName: string;
    proxyTeacherId?: number | string;
    proxyTeacherName?: string;
    isProxyToday?: boolean;
}

export interface CreditStat {
    id: number;
    courseName: string;
    plannedHours: number;
    deliveredHours: number;
}

export interface PendingClass {
    id: number;
    time: string;
    className: string;
    teacherName: string;
}

export interface Student {
    id: number;
    name: string;
    rollNo: string;
}

export interface AuditLog {
    id: number;
    timestamp: string;
    principalId: number; // Digital signature
    action: string;
    entityId: number;
    reason: string;
    description: string;
}

export interface SubmittedClass extends PendingClass {
    submittedAt: string;
    isLocked: boolean;
}

const auditLogsStore: AuditLog[] = []; // In-memory store

export interface LeaveRequest {
    id: number;
    type: 'Student' | 'Teacher';
    name: string;
    details: string; // "Sick Leave", "Urgent Work"
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface RegistrationRequest {
    id: number;
    studentName: string;
    rollNo: string;
    class: string;
    registeredBy: string; // "Principal"
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

// In-memory stores for mocks
// In-memory stores for mocks
let schoolStatusStore: { status: 'Open' | 'Closed'; reason?: string } = { status: 'Open' };
let broadcastStore: { message: string; audiences: string[]; timestamp: string }[] = [];

// Stateful Proxy Store
interface ProxyRecord {
    slotId: number;
    teacherId: number | string;
    date: string;
}
let proxyStore: ProxyRecord[] = [];

// Stateful Pending Classes
let pendingClassesStore: PendingClass[] = [
    { id: 1, time: "09:00 AM", className: "Calculus I (CS-101)", teacherName: "Dr. Smith" },
    { id: 2, time: "11:00 AM", className: "Physics 101", teacherName: "Dr. Einstein" },
];

export interface SubUser {
    id: number;
    name: string;
    email: string;
    role: 'HOD' | 'Clerk';
    status: 'Active' | 'Inactive';
    context?: string; // e.g. "Computer Science" for HOD
}

let subUsersStore: SubUser[] = [
    { id: 1, name: "Alice HOD", email: "alice@uni.edu", role: 'HOD', status: 'Active', context: "Computer Science" },
    { id: 2, name: "Bob Clerk", email: "bob@uni.edu", role: 'Clerk', status: 'Active' },
    // K-12 Mocks
    { id: 3, name: "Mr. Chip (Head)", email: "chip@school.edu", role: 'HOD', status: 'Active', context: "Grade 10" },
];

let leaveRequestsStore: LeaveRequest[] = [
    { id: 1, type: 'Student', name: 'John Doe', details: 'Fever', date: new Date().toISOString(), status: 'Pending' },
    { id: 2, type: 'Teacher', name: 'Dr. Strange', details: 'Conference', date: new Date().toISOString(), status: 'Pending' },
    { id: 3, type: 'Student', name: 'Jane Smith', details: 'Family Event', date: new Date().toISOString(), status: 'Pending' },
];

let registrationRequestsStore: RegistrationRequest[] = [
    { id: 1, studentName: 'New Student A', rollNo: 'CS-202X-999', class: 'CS-101', registeredBy: 'Principal', date: new Date().toISOString(), status: 'Pending' }
];

export const dashboardService = {
    getPrincipalStats: async (): Promise<DashboardStats> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // In a real app, we'd fetch credit stats here to calculate health
        // For mock, let's say:
        const covered = 850;
        const planned = 1000;

        // Calculate pending actions
        const pendingLeaves = leaveRequestsStore.filter(l => l.status === 'Pending').length;
        const pendingRegs = registrationRequestsStore.filter(r => r.status === 'Pending').length;

        // Calculate approved leaves for presence adjustment
        const approvedStudentLeaves = leaveRequestsStore.filter(l => l.type === 'Student' && l.status === 'Approved').length;

        const totalStudents = 2450;
        const physicalPresent = 2250;
        // Requirement: "Approvals must affect absenteeism calculations so KPI Student Presence is not penalized for approved leave."
        // We treat approved leaves as "Excused" and effectively "Present" for the "KPI Presence Score".
        const effectivePresent = physicalPresent + approvedStudentLeaves;

        return {
            studentPresence: {
                present: effectivePresent,
                total: totalStudents
            },
            teacherAttendance: {
                checkedIn: 138,
                total: 145
            },
            pendingActions: {
                leaves: pendingLeaves,
                registrations: pendingRegs
            },
            scheduleHealth: {
                coveredSessions: covered,
                plannedSessions: planned
            }
        };
    },

    getCreditStats: async (): Promise<CreditStat[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [
            { id: 1, courseName: "Calculus I (CS-101)", plannedHours: 45, deliveredHours: 40 },
            { id: 2, courseName: "Physics 101", plannedHours: 30, deliveredHours: 25 },
            { id: 3, courseName: "Data Structures", plannedHours: 40, deliveredHours: 38 },
            { id: 4, courseName: "English Lit", plannedHours: 20, deliveredHours: 18 },
        ];
    },

    getDepartments: async (): Promise<Department[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const depts = localStorageRepository.departments.getAll();
        const classes = localStorageRepository.classes.getAll();
        const teachers = localStorageRepository.teachers.getAll();

        return depts.map(d => {
            const hod = d.hodId ? teachers.find(t => t.id === d.hodId) : null;
            const deptClassesCount = classes.filter(c => c.departmentId === d.id).length;

            return {
                id: d.id, // Ensure id is numeric if expected by legacy, but wait, DB is string. We cast it when rendering
                name: d.name,
                hodName: hod ? hod.name : "Pending",
                hodId: d.hodId,
                totalClasses: deptClassesCount,
                status: hod ? "Active" : "Inactive"
            } as any;
        });
    },

    createDepartment: async (data: { name: string; code?: string }): Promise<void> => {
        // Wait, what institution? We default to 1
        await hierarchyService.createDepartment(1, data.name, "Main Block");
        return;
    },

    getTeachersByDepartment: async (deptId: string | number): Promise<import("../types/hierarchy").Teacher[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const allTeachers = localStorageRepository.teachers.getAll();
        if (deptId === "all") return allTeachers;
        return allTeachers.filter(t => t.departmentId === String(deptId));
    },

    assignHOD: async (deptId: number | string, teacherId: number | string): Promise<void> => {
        await hierarchyService.assignHOD(String(deptId), String(teacherId));
        return;
    },

    // K-12 Methods
    getGrades: async (): Promise<Grade[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: 1, name: "Grade 9", sectionsCount: 3, headTeacher: "Mr. Anderson" },
            { id: 2, name: "Grade 10", sectionsCount: 3, headTeacher: "Ms. Roberts" },
            { id: 3, name: "Grade 11", sectionsCount: 2, headTeacher: "Pending" },
        ];
    },

    createGrade: async (name: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log("Created Grade:", name);
        return;
    },

    assignHeadTeacher: async (gradeId: number, teacherId: number | string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log(`Assigned Head Teacher ${teacherId} to Grade ${gradeId}`);
        return;
    },

    getSections: async (_gradeId: number): Promise<Section[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            { id: 101, name: "Section A", gradeId: 1, totalStudents: 30 },
            { id: 102, name: "Section B", gradeId: 1, totalStudents: 28 },
        ];
    },

    getSchedule: async (_contextId: number, date: string, institutionType: string = "UNIVERSITY"): Promise<ScheduleSlot[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        // console.log(`Fetching schedule for context ${contextId} on ${date}`);

        // Check if we have any proxies for this date in our store
        // For simplified matching, we just check slotId/date in `proxyStore`
        const dateString = new Date(date).toDateString();

        const universitySubjects = ["Calculus I", "Linear Algebra", "Discrete Math"];
        const k12Subjects = ["Mathematics", "English", "Urdu", "General Science", "Islamiat", "Pakistan Studies", "Computer"];

        // Select subjects based on institution type
        const subjects = institutionType === "SCHOOL" ? k12Subjects : universitySubjects;

        const baseSchedule = [
            {
                id: 1,
                time: "09:00 AM - 10:00 AM",
                subject: subjects[0],
                teacherId: 101,
                teacherName: institutionType === "SCHOOL" ? "Mr. Anderson" : "Dr. Smith",
            },
            {
                id: 2,
                time: "10:00 AM - 11:00 AM",
                subject: subjects[1],
                teacherId: 102,
                teacherName: institutionType === "SCHOOL" ? "Ms. Roberts" : "Prof. Johnson"
            },
            {
                id: 3,
                time: "11:00 AM - 12:00 PM",
                subject: subjects[2],
                teacherId: 101,
                teacherName: institutionType === "SCHOOL" ? "Mr. Anderson" : "Dr. Smith"
            },
        ];

        // Merge Proxies
        return baseSchedule.map(slot => {
            const proxy = proxyStore.find(p => p.slotId === slot.id && new Date(p.date).toDateString() === dateString);
            if (proxy) {
                return {
                    ...slot,
                    proxyTeacherId: proxy.teacherId,
                    proxyTeacherName: "Assigned Proxy", // In real app lookup name
                    isProxyToday: true
                };
            }
            return slot;
        });
    },

    assignScheduleProxy: async (slotId: number, teacherId: number | string, date: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        proxyStore.push({ slotId, teacherId, date });

        // Create audit log for proxy assignment
        const newLog: AuditLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            principalId: 1, // Mock principal ID
            action: "PROXY_ASSIGNMENT",
            entityId: slotId,
            reason: "Manual proxy assignment",
            description: `Assigned proxy teacher (ID: ${teacherId}) to slot ${slotId} for ${new Date(date).toLocaleDateString()}`
        };
        auditLogsStore.unshift(newLog);

        console.log(`Assigned Proxy ${teacherId} to Slot ${slotId} on ${date}`);
        return;
    },

    getClasses: async (departmentId?: string): Promise<Class[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        let classes = localStorageRepository.classes.getAll();
        if (departmentId) {
            classes = classes.filter((c: Class) => c.departmentId === departmentId);
        }
        return classes;
    },

    getPendingAttendance: async (departmentId?: string, classId?: string): Promise<PendingClass[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        let pending = [...pendingClassesStore];

        // Mock filtering logic for demo
        if (classId) {
            // Just matching strings since our mock uses className="Calculus I (CS-101)" vs ClassName "BSCS-Semester 4-A"
            // For a robust system, PendingClass would have classId. Here we simulate it simply:
            pending = pending.filter(p => classId === "BSCS-Semester 4-A" ? p.className.includes("CS-101") : true);
        } else if (departmentId && departmentId === "Computer Science") {
            pending = pending.filter(p => p.className.includes("CS-101"));
        } else if (departmentId && departmentId !== "Computer Science") {
            pending = pending.filter(p => !p.className.includes("CS-101"));
        }

        return pending;
    },

    getStudentsForClass: async (_classId: number): Promise<Student[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        // Mock students
        return Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Student ${i + 1}`,
            rollNo: `CS-202X-${100 + i}`
        }));
    },

    markAttendance: async (classId: number, records: { studentId: number; status: 'Present' | 'Absent' }[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        // Remove from pending
        pendingClassesStore = pendingClassesStore.filter(c => c.id !== classId);
        console.log(`Marked attendance for class ${classId}`, records);
        return;
    },

    getSubmittedAttendance: async (): Promise<SubmittedClass[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        // Mock submitted classes (some locked if "yesterday")
        return [
            {
                id: 101,
                time: "09:00 AM",
                className: "Chemistry 101",
                teacherName: "Dr. White",
                submittedAt: new Date().toISOString(),
                isLocked: false // Today
            },
            {
                id: 102,
                time: "10:00 AM",
                className: "History 202",
                teacherName: "Prof. Green",
                submittedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                isLocked: true
            },
        ];
    },

    updateAttendance: async (classId: number, records: any[], principalId: number, reason?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock Lock Check logic
        const targetClass = (await dashboardService.getSubmittedAttendance()).find(c => c.id === classId);

        if (targetClass?.isLocked) {
            if (!reason) {
                throw new Error("Attendance is locked. A reason is required to override.");
            }
            // Log Audit
            const newLog: AuditLog = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                principalId,
                action: "ATTENDANCE_OVERRIDE",
                entityId: classId,
                reason,
                description: `Overrode attendance for class ${targetClass.className} (${targetClass.time})`
            };
            auditLogsStore.unshift(newLog); // Add to beginning
            console.log("Audit Log created:", newLog);
        }

        console.log(`Updated attendance for class ${classId}`, records);
        return;
    },

    getAuditLogs: async (): Promise<AuditLog[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [...auditLogsStore];
    },

    getLeaves: async (): Promise<LeaveRequest[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...leaveRequestsStore];
    },

    processLeave: async (id: number, status: 'Approved' | 'Rejected'): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const idx = leaveRequestsStore.findIndex(l => l.id === id);
        if (idx !== -1) {
            leaveRequestsStore[idx].status = status;
        }
        return;
    },

    processRegistration: async (id: number, status: 'Approved' | 'Rejected'): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const idx = registrationRequestsStore.findIndex(r => r.id === id);
        if (idx !== -1) {
            registrationRequestsStore[idx].status = status;
        }
        return;
    },

    getRegistrations: async (): Promise<RegistrationRequest[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...registrationRequestsStore];
    },

    getSchoolStatus: async (): Promise<{ status: 'Open' | 'Closed'; reason?: string }> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { ...schoolStatusStore };
    },

    toggleSchoolStatus: async (status: 'Open' | 'Closed', reason?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        schoolStatusStore = { status, reason };
        // Log to audit if closing
        if (status === 'Closed') {
            auditLogsStore.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                principalId: 1, // Mock principal
                action: "SCHOOL_CLOSURE",
                entityId: 0,
                reason: reason || "No reason provided",
                description: "School closed via Emergency Control"
            });
        }
        return;
    },

    broadcastMessage: async (message: string, audiences: string[]): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        broadcastStore.unshift({ message, audiences, timestamp: new Date().toISOString() });
        console.log("Broadcast sent:", message);
        return;
    },

    getSubUsers: async (): Promise<SubUser[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [...subUsersStore];
    },

    createSubUser: async (user: Omit<SubUser, 'id' | 'status'>): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newItem: SubUser = {
            id: Date.now(),
            status: 'Active',
            ...user
        };
        subUsersStore.push(newItem);
        console.log("Created sub-user:", newItem);
        return;
    }
};
