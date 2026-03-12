export interface Department {
    id: string;
    schoolId: number;
    name: string;
    building: string;
    hodId?: string; // Current teacher ID assigned as HOD
}

export interface HODAssignment {
    id: string;
    departmentId: string;
    teacherId: string;
    teacherName: string;
    startDate: string;
    endDate?: string;
}

export interface Class {
    id: string;
    departmentId: string;
    name: string; // e.g., "BSCS-Semester 4-A"
    classTeacherId?: string; // ID of the teacher in charge
}

export interface Subject {
    id: string;
    departmentId: string;
    name: string;
    classId?: string; // Links a subject directly to a class
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface Schedule {
    id: string;
    classId: string;
    subjectId: string;
    teacherId?: string;
    teacherName?: string;
    day: DayOfWeek;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
}

export interface Teacher {
    id: string;
    name: string;
    firstName?: string; // New
    lastName?: string;  // New
    email: string;
    phone: string;
    cnic?: string;          // New
    gender?: "Male" | "Female" | "Other"; // New
    dateOfBirth?: string;   // New
    qualification?: string; // New
    experienceYears?: number; // New
    addressLine1?: string;  // New
    city?: string;          // New
    province?: string;      // New
    country?: string;       // New
    assignedInstitutionId?: string; // New
    status?: "Active" | "Pending" | "Inactive"; // New
    createdAt?: string;     // New

    departmentId: string;
    specialization: string;

    designation?: string;
    type: "HOD" | "NORMAL";
    joiningDate: string;

    // Performance Metrics
    totalWorkload: number;     // hours/week
    punctuality: number;       // percentage 0-100
    deliveryRate: number;      // percentage 0-100
    monthlyAttendance: number; // percentage 0-100
    scheduledHours: number;
    actualHours: number;
}

export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    phone: string;
    departmentId: string;
    classId: string;
    joiningDate: string;

    // Guardian/Parent Info
    guardianName: string;
    guardianPhone: string;

    // Academic & Performance
    cgpa?: number;
    attendance: number; // percentage

    // Status
    status: "ACTIVE" | "GRADUATED" | "DROPPED";
}

export interface TeacherRequest {
    id: string;
    fromDepartmentId: string;
    toDepartmentId: string;
    requestedTeacherId: string;
    requestedTeacherName: string;
    classId: string;
    subjectId: string;
    day: DayOfWeek;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    status: "PENDING" | "APPROVED" | "REJECTED";
    note?: string;
    createdAt: string;
}
