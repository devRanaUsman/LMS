import { type Institution, VerticalType, GradeLevel, InstitutionStatus } from "../types/institution";
import { type PrincipalHistory, type RetirementRequest } from "../types/principal";
import { type AuditLog } from "../types/audit";
import { type Department, type Class, type Subject, type Schedule, type Teacher, type Student, type TeacherRequest } from "../types/hierarchy";
import { type Role } from "../types/roles";

const DB_KEY = "school_portal_db_v1";

interface DatabaseSchema {
    institutions: Institution[];
    retirementRequests: RetirementRequest[];
    auditLogs: AuditLog[];
    principalHistory: PrincipalHistory[];
    departments: Department[];
    classes: Class[];
    subjects: Subject[];
    schedules: Schedule[];
    teachers: Teacher[];
    students: Student[];
    roles: Role[];
    attendanceRecords: AttendanceRecord[];
    attendanceRequests: AttendanceRequest[];
    notifications: Notification[];
    teacherRequests: TeacherRequest[];
}

const INITIAL_DATA: Institution[] = [
    {
        id: 1,
        emisCode: "EMIS-1001",
        name: "Central University",
        gps: { lat: 31.5204, lng: 74.3587 },
        verticalType: VerticalType.UNIVERSITY,
        status: InstitutionStatus.ACTIVE,
        details: { initialDepartmentCount: 10 },
        address: "Lahore, Pakistan", // Added missing address
        createdAt: new Date().toISOString(),
        settings: {
            closeTime: "17:00"
        }
    },
    {
        id: 2,
        emisCode: "EMIS-2002",
        name: "City High School",
        gps: { lat: 31.5826, lng: 74.3272 },
        verticalType: VerticalType.K12,
        status: InstitutionStatus.ACTIVE,
        details: { gradeRange: GradeLevel.HIGH },
        address: "Lahore, Pakistan", // Added missing address
        createdAt: new Date().toISOString(),
        settings: {
            closeTime: "14:30"
        }
    }
];

export const localStorageRepository = {
    // ... existing load function ...
    load: (): DatabaseSchema => {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (!raw) {
                return localStorageRepository.seed();
            }
            // Migration/Safety check for new fields
            const data = JSON.parse(raw);
            if (!data.retirementRequests) data.retirementRequests = [];
            if (!data.auditLogs) data.auditLogs = [];
            if (!data.principalHistory) data.principalHistory = [];
            if (!data.departments) data.departments = [];
            // if (!data.classes) data.classes = [];
            if (!data.classes || data.classes.length === 0) {
                data.classes = localStorageRepository.getClassSeed();
                localStorage.setItem(DB_KEY, JSON.stringify(data));
            }
            if (!data.subjects) data.subjects = [];

            // Fix: Reseed schedules if empty or missing
            if (!data.schedules || data.schedules.length === 0) {
                data.schedules = localStorageRepository.getScheduleSeed();
                localStorage.setItem(DB_KEY, JSON.stringify(data));
            }

            if (!data.roles) data.roles = [];

            // FORCE Reseed teachers if they lack new fields (simple check)
            if (!data.teachers || data.teachers.length === 0 || !data.teachers[0].type) {
                data.teachers = localStorageRepository.getTeacherSeed();
                localStorage.setItem(DB_KEY, JSON.stringify(data));
            }

            // FORCE Reseed students if missing new seed data (BSCS 3rd sem)
            if (!data.students || !data.students.some((s: any) => s.id === 's_6')) {
                const seed = localStorageRepository.getStudentSeed();
                const existing = data.students || [];
                // Simple merge: add students from seed that don't exist in current data
                const newStudents = seed.filter(s => !existing.some((e: any) => e.id === s.id));
                data.students = [...existing, ...newStudents];
                localStorage.setItem(DB_KEY, JSON.stringify(data));
            }

            return data;
        } catch (e) {
            console.error("Failed to load DB", e);
            return {
                institutions: [],
                retirementRequests: [],
                auditLogs: [],
                principalHistory: [],
                departments: [],
                classes: [],
                subjects: [],
                schedules: [],
                teachers: [],
                students: [],
                roles: [],
                attendanceRecords: [],
                attendanceRequests: [],
                notifications: [],
                teacherRequests: []
            };
        }
    },

    save: (data: DatabaseSchema) => {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save DB", e);
        }
    },

    getTeacherSeed: (): Teacher[] => {
        return [
            {
                id: "t_1",
                name: "Dr. Ahmed Hassan",
                firstName: "Ahmed",
                lastName: "Hassan",
                email: "ahmed.hassan@uni.edu.pk",
                phone: "+923001234567",
                specialization: "Computer Science",
                departmentId: "Computer Science",
                type: "HOD",
                joiningDate: "2015-08-20",
                totalWorkload: 12,
                punctuality: 98,
                deliveryRate: 95,
                monthlyAttendance: 100,
                scheduledHours: 48,
                actualHours: 48,
                status: "Active",
                city: "Lahore",
                province: "Punjab",
                country: "Pakistan",
                qualification: "PhD Computer Science"
            },
            {
                id: "t_2",
                name: "Prof. Maria Khan",
                firstName: "Maria",
                lastName: "Khan",
                email: "maria.khan@uni.edu.pk",
                phone: "+923007654321",
                specialization: "Software Engineering",
                departmentId: "Software Engineering",
                type: "NORMAL",
                joiningDate: "2018-02-10",
                totalWorkload: 18,
                punctuality: 92,
                deliveryRate: 88,
                monthlyAttendance: 95,
                scheduledHours: 72,
                actualHours: 68,
                status: "Active",
                city: "Karachi",
                province: "Sindh",
                country: "Pakistan",
                qualification: "MS Software Engineering"
            },
            {
                id: "t_3",
                name: "Dr. Salman Sheikh",
                firstName: "Salman",
                lastName: "Sheikh",
                email: "salman.sheikh@uni.edu.pk",
                phone: "+923214567890",
                specialization: "Data Science",
                departmentId: "Data Science",
                type: "HOD",
                joiningDate: "2016-11-05",
                totalWorkload: 14,
                punctuality: 96,
                deliveryRate: 92,
                monthlyAttendance: 98,
                scheduledHours: 56,
                actualHours: 55,
                status: "Active",
                city: "Islamabad",
                province: "Islamabad",
                country: "Pakistan",
                qualification: "PhD Data Science"
            },
            {
                id: "t_4",
                name: "Engr. Fatima Ali",
                firstName: "Fatima",
                lastName: "Ali",
                email: "fatima.ali@uni.edu.pk",
                phone: "+923331122334",
                specialization: "Cyber Security",
                departmentId: "Cyber Security",
                type: "NORMAL",
                joiningDate: "2020-09-01",
                totalWorkload: 20,
                punctuality: 85,
                deliveryRate: 80,
                monthlyAttendance: 90,
                scheduledHours: 80,
                actualHours: 72,
                status: "Active",
                city: "Lahore",
                province: "Punjab",
                country: "Pakistan",
                qualification: "MS Cyber Security"
            },
            {
                id: "t_5",
                name: "Zubair Qureshi",
                firstName: "Zubair",
                lastName: "Qureshi",
                email: "zubair.q@school.edu.pk",
                phone: "+923456677889",
                specialization: "Mathematics",
                departmentId: "Mathematics",
                type: "NORMAL",
                joiningDate: "2019-01-15",
                totalWorkload: 22,
                punctuality: 88,
                deliveryRate: 90,
                monthlyAttendance: 94,
                scheduledHours: 88,
                actualHours: 82,
                status: "Active",
                city: "Multan",
                province: "Punjab",
                country: "Pakistan",
                qualification: "MSc Mathematics"
            },
            {
                id: "t_6",
                name: "Dr. Ayesha Malik",
                firstName: "Ayesha",
                lastName: "Malik",
                email: "ayesha.m@uni.edu.pk",
                phone: "+923019988776",
                specialization: "Artificial Intelligence",
                departmentId: "Artificial Intelligence",
                type: "NORMAL",
                joiningDate: "2021-03-30",
                totalWorkload: 16,
                punctuality: 99,
                deliveryRate: 98,
                monthlyAttendance: 99,
                scheduledHours: 64,
                actualHours: 63,
                status: "Active",
                city: "Lahore",
                province: "Punjab",
                country: "Pakistan",
                qualification: "PhD AI"
            },
            {
                id: "t_7",
                name: "Mr. Bilal Ahmed",
                firstName: "Bilal",
                lastName: "Ahmed",
                email: "bilal.ahmed@uni.edu.pk",
                phone: "+923124455667",
                specialization: "Web Development",
                departmentId: "Computer Science",
                type: "NORMAL",
                joiningDate: "2022-07-12",
                totalWorkload: 24,
                punctuality: 80,
                deliveryRate: 75,
                monthlyAttendance: 85,
                scheduledHours: 96,
                actualHours: 80,
                status: "Active",
                city: "Faisalabad",
                province: "Punjab",
                country: "Pakistan",
                qualification: "BSCS"
            }
        ];
    },

    getClassSeed: (): Class[] => {
        return [
            {
                id: "BSCS-Semester 4-A", // Matching student seed classId
                name: "BSCS-Semester 4-A",
                departmentId: "Computer Science",
                classTeacherId: "t_2", // Prof. Maria Khan
            },
            {
                id: "SE-Semester 2-B",
                name: "SE-Semester 2-B",
                departmentId: "Software Engineering",
                classTeacherId: "t_1", // Dr. Ahmed Hassan
            },
            {
                id: "DS-Semester 6-A",
                name: "DS-Semester 6-A",
                departmentId: "Data Science",
                classTeacherId: "t_3", // Dr. Salman Sheikh
            }
        ];
    },

    getScheduleSeed: (): Schedule[] => {
        return [
            // Schedules for t_2 (Prof. Maria Khan) - Software Engineering
            {
                id: "sch_1",
                classId: "BSCS-Semester 4-A",
                subjectId: "Software Engineering 1",
                teacherId: "t_2",
                teacherName: "Prof. Maria Khan",
                day: "Monday",
                startTime: "09:00",
                endTime: "10:30"
            },
            {
                id: "sch_2",
                classId: "BSCS-Semester 4-A",
                subjectId: "Software Lab",
                teacherId: "t_2",
                teacherName: "Prof. Maria Khan",
                day: "Wednesday",
                startTime: "11:00",
                endTime: "12:30"
            },
            {
                id: "sch_3",
                classId: "SE-Semester 2-B",
                subjectId: "Intro to SE",
                teacherId: "t_2",
                teacherName: "Prof. Maria Khan",
                day: "Friday",
                startTime: "10:00",
                endTime: "11:30"
            },
            // Schedules for t_1 (Dr. Ahmed Hassan) - CS
            {
                id: "sch_4",
                classId: "BSCS-Semester 4-A",
                subjectId: "Computer Architecture",
                teacherId: "t_1",
                teacherName: "Dr. Ahmed Hassan",
                day: "Tuesday",
                startTime: "09:00",
                endTime: "10:30"
            }
        ];
    },

    getStudentSeed: (): Student[] => {
        return [
            {
                id: "s_1",
                name: "Ali Khan",
                rollNumber: "BSCS-2023-001",
                email: "ali.khan@uni.edu.pk",
                phone: "+923001112233",
                departmentId: "Computer Science",
                classId: "BSCS-Semester 4-A",
                joiningDate: "2023-09-01",
                guardianName: "Ahmed Khan",
                guardianPhone: "+923004445566",
                cgpa: 3.5,
                attendance: 92,
                status: "ACTIVE"
            },
            {
                id: "s_2",
                name: "Sara Ahmed",
                rollNumber: "BSCS-2023-002",
                email: "sara.ahmed@uni.edu.pk",
                phone: "+923002223344",
                departmentId: "Computer Science",
                classId: "BSCS-Semester 4-A",
                joiningDate: "2023-09-01",
                guardianName: "Rehman Ahmed",
                guardianPhone: "+923005556677",
                cgpa: 3.8,
                attendance: 96,
                status: "ACTIVE"
            },
            {
                id: "s_3",
                name: "Omar Farooq",
                rollNumber: "BSCS-2023-003",
                email: "omar.farooq@uni.edu.pk",
                phone: "+923003334455",
                departmentId: "Software Engineering",
                classId: "SE-Semester 2-B",
                joiningDate: "2024-02-01",
                guardianName: "Farooq Azam",
                guardianPhone: "+923006667788",
                cgpa: 3.2,
                attendance: 88,
                status: "ACTIVE"
            },
            {
                id: "s_4",
                name: "Zainab Bibi",
                rollNumber: "BSCS-2023-004",
                email: "zainab.bibi@uni.edu.pk",
                phone: "+923004445566",
                departmentId: "Data Science",
                classId: "DS-Semester 6-A",
                joiningDate: "2022-09-01",
                guardianName: "Muhammad Ali",
                guardianPhone: "+923007778899",
                cgpa: 3.9,
                attendance: 98,
                status: "ACTIVE"
            },
            {
                id: "s_5",
                name: "Bilal Raza",
                rollNumber: "BSCS-2023-005",
                email: "bilal.raza@uni.edu.pk",
                phone: "+923005556677",
                departmentId: "Computer Science",
                classId: "BSCS-Semester 4-A",
                joiningDate: "2023-09-01",
                guardianName: "Raza Ali",
                guardianPhone: "+923008889900",
                cgpa: 2.9,
                attendance: 85,
                status: "ACTIVE"
            },
            // Students for BSCS 3rd sem (matching user screenshot class name)
            {
                id: "s_6",
                name: "Hamza Malik",
                rollNumber: "BSCS-2024-001",
                email: "hamza.malik@uni.edu.pk",
                phone: "+923009990011",
                departmentId: "Computer Science",
                classId: "BSCS 3rd sem",
                joiningDate: "2023-09-01",
                guardianName: "Malik Azam",
                guardianPhone: "+923001122334",
                cgpa: 3.4,
                attendance: 90,
                status: "ACTIVE"
            },
            {
                id: "s_7",
                name: "Ayesha Khan",
                rollNumber: "BSCS-2024-002",
                email: "ayesha.khan@uni.edu.pk",
                phone: "+923002233445",
                departmentId: "Computer Science",
                classId: "BSCS 3rd sem",
                joiningDate: "2023-09-01",
                guardianName: "Khan Muhammad",
                guardianPhone: "+923005566778",
                cgpa: 3.7,
                attendance: 95,
                status: "ACTIVE"
            },
            {
                id: "s_8",
                name: "Usman Ali",
                rollNumber: "BSCS-2024-003",
                email: "usman.ali@uni.edu.pk",
                phone: "+923003344556",
                departmentId: "Computer Science",
                classId: "BSCS 3rd sem",
                joiningDate: "2023-09-01",
                guardianName: "Ali Hassan",
                guardianPhone: "+923006677889",
                cgpa: 3.1,
                attendance: 82,
                status: "ACTIVE"
            }
        ];
    },

    seed: (): DatabaseSchema => {
        const data: DatabaseSchema = {
            institutions: INITIAL_DATA,
            retirementRequests: [],
            auditLogs: [],
            principalHistory: [],
            departments: [],
            classes: localStorageRepository.getClassSeed(),
            subjects: [],
            schedules: localStorageRepository.getScheduleSeed(),
            teachers: localStorageRepository.getTeacherSeed(),
            students: localStorageRepository.getStudentSeed(),
            roles: [],
            attendanceRecords: [],
            attendanceRequests: [],
            notifications: [],
            teacherRequests: []
        };
        localStorageRepository.save(data);
        return data;
    },

    institutions: {
        getAll: () => localStorageRepository.load().institutions,
        add: (inst: Institution) => {
            const db = localStorageRepository.load();
            if (db.institutions.some(i => i.emisCode === inst.emisCode)) {
                throw new Error(`EMIS Code ${inst.emisCode} already exists in database.`);
            }
            db.institutions.push(inst);
            localStorageRepository.save(db);
        },
        update: (inst: Institution) => {
            const db = localStorageRepository.load();
            const idx = db.institutions.findIndex(i => i.id === inst.id);
            if (idx !== -1) {
                db.institutions[idx] = inst;
                localStorageRepository.save(db);
            }
        },
        findByEmis: (emis: string) => localStorageRepository.load().institutions.find(i => i.emisCode === emis)
    },

    retirementRequests: {
        getAll: () => localStorageRepository.load().retirementRequests,
        add: (req: RetirementRequest) => {
            const db = localStorageRepository.load();
            db.retirementRequests.push(req);
            localStorageRepository.save(db);
        },
        update: (req: RetirementRequest) => {
            const db = localStorageRepository.load();
            const index = db.retirementRequests.findIndex(r => r.id === req.id);
            if (index !== -1) {
                db.retirementRequests[index] = req;
                localStorageRepository.save(db);
            }
        },
        findById: (id: string) => localStorageRepository.load().retirementRequests.find(r => r.id === id)
    },

    auditLogs: {
        add: (log: AuditLog) => {
            const db = localStorageRepository.load();
            db.auditLogs.push(log);
            localStorageRepository.save(db);
        },
        getByTarget: (targetId: string) => localStorageRepository.load().auditLogs.filter(l => l.targetId === targetId)
    },

    principalHistory: {
        getBySchool: (schoolId: string) => localStorageRepository.load().principalHistory.filter(h => h.schoolId === schoolId),
        add: (history: PrincipalHistory) => {
            const db = localStorageRepository.load();
            db.principalHistory.push(history);
            localStorageRepository.save(db);
        }
    },

    departments: {
        getAll: () => localStorageRepository.load().departments,
        add: (dept: Department) => {
            const db = localStorageRepository.load();
            db.departments.push(dept);
            localStorageRepository.save(db);
        },
        update: (dept: Department) => {
            const db = localStorageRepository.load();
            const idx = db.departments.findIndex(d => d.id === dept.id);
            if (idx !== -1) {
                db.departments[idx] = dept;
                localStorageRepository.save(db);
            }
        },
        getById: (id: string) => localStorageRepository.load().departments.find(d => d.id === id),
        delete: (id: string) => {
            const db = localStorageRepository.load();
            db.departments = db.departments.filter(d => d.id !== id);
            localStorageRepository.save(db);
        }
    },

    classes: {
        getAll: () => localStorageRepository.load().classes,
        add: (cls: Class) => {
            const db = localStorageRepository.load();
            db.classes.push(cls);
            localStorageRepository.save(db);
        },
        getByDepartment: (deptId: string) => localStorageRepository.load().classes.filter(c => c.departmentId === deptId)
    },

    subjects: {
        getAll: () => localStorageRepository.load().subjects,
        add: (sub: Subject) => {
            const db = localStorageRepository.load();
            db.subjects.push(sub);
            localStorageRepository.save(db);
        },
        getByDepartment: (deptId: string) => localStorageRepository.load().subjects.filter(s => s.departmentId === deptId),
        getByClass: (classId: string) => localStorageRepository.load().subjects.filter(s => s.classId === classId)
    },

    schedules: {
        getAll: () => localStorageRepository.load().schedules,
        add: (sch: Schedule) => {
            const db = localStorageRepository.load();
            db.schedules.push(sch);
            localStorageRepository.save(db);
        },
        getByClass: (classId: string) => localStorageRepository.load().schedules.filter(s => s.classId === classId),
        getByTeacher: (teacherId: string) => localStorageRepository.load().schedules.filter(s => s.teacherId === teacherId)
    },

    teachers: {
        getAll: () => localStorageRepository.load().teachers,
        getById: (id: string) => localStorageRepository.load().teachers.find(t => t.id === id),
        add: (teacher: Teacher) => {
            const db = localStorageRepository.load();
            db.teachers.push(teacher);
            localStorageRepository.save(db);
        }
    },

    teacherRequests: {
        getAll: () => localStorageRepository.load().teacherRequests || [],
        add: (req: TeacherRequest) => {
            const db = localStorageRepository.load();
            if (!db.teacherRequests) db.teacherRequests = [];
            db.teacherRequests.push(req);
            localStorageRepository.save(db);
        },
        update: (req: TeacherRequest) => {
            const db = localStorageRepository.load();
            if (!db.teacherRequests) db.teacherRequests = [];
            const idx = db.teacherRequests.findIndex(r => r.id === req.id);
            if (idx !== -1) {
                db.teacherRequests[idx] = req;
                localStorageRepository.save(db);
            }
        },
        getByToDepartment: (deptId: string) => {
            const db = localStorageRepository.load();
            return (db.teacherRequests || []).filter(r => r.toDepartmentId === deptId);
        }
    },

    roles: {
        getAll: () => localStorageRepository.load().roles,
        add: (role: Role) => {
            const db = localStorageRepository.load();
            db.roles.push(role);
            localStorageRepository.save(db);
        },
        update: (role: Role) => {
            const db = localStorageRepository.load();
            const idx = db.roles.findIndex(r => r.id === role.id);
            if (idx !== -1) {
                db.roles[idx] = role;
                localStorageRepository.save(db);
            }
        },
        delete: (id: string) => {
            const db = localStorageRepository.load();
            db.roles = db.roles.filter(r => r.id !== id);
            localStorageRepository.save(db);
        }
    },

    students: {
        getAll: () => {
            const db = localStorageRepository.load();
            // Fallback if data is missing from old seed
            if (!db.students) {
                db.students = localStorageRepository.getStudentSeed();
                localStorageRepository.save(db);
                return db.students;
            }
            return db.students;
        },
        getById: (id: string) => {
            const students = localStorageRepository.students.getAll();
            return students.find(s => s.id === id);
        },
        getByClass: (classId: string) => {
            const students = localStorageRepository.students.getAll();
            return students.filter(s => s.classId === classId);
        },
        add: (student: Student) => {
            const db = localStorageRepository.load();
            if (!db.students) db.students = [];
            db.students.push(student);
            localStorageRepository.save(db);
        }
    },

    // New Attendance Methods
    attendance: {
        save: (record: AttendanceRecord) => {
            const db = localStorageRepository.load();
            if (!db.attendanceRecords) db.attendanceRecords = [];

            // Remove existing if any (overwrite)
            const existingIdx = db.attendanceRecords.findIndex(
                r => r.scheduleId === record.scheduleId && r.date === record.date
            );

            // ENFORCEMENT LOGIC
            if (existingIdx !== -1) {
                const existing = db.attendanceRecords[existingIdx];
                // Check if locked and no valid grant
                if (existing.isLocked) {
                    const now = new Date();
                    const allowedUntil = existing.allowedUntil ? new Date(existing.allowedUntil) : null;

                    if (!allowedUntil || now > allowedUntil) {
                        throw new Error("Attendance is closed. Please submit a request to edit/mark attendance.");
                    }
                }

                // Preserve original submittedAt
                record.submittedAt = existing.submittedAt || record.submittedAt;

                // CONSUME GRANT & LOCK
                // Always lock on save, and clear the grant (one-time use or time-window closes on submit)
                db.attendanceRecords[existingIdx] = {
                    ...record,
                    isLocked: true,
                    allowedUntil: undefined // Clear grant after successful submit
                };
            } else {
                // New record
                record.isLocked = true;
                db.attendanceRecords.push(record);
            }

            localStorageRepository.save(db);
        },
        getByScheduleAndDate: (scheduleId: string, date: string) => {
            const db = localStorageRepository.load();
            if (!db.attendanceRecords) return undefined;
            return db.attendanceRecords.find(r => r.scheduleId === scheduleId && r.date === date);
        },
        updateLockStatus: (recordId: string, isLocked: boolean) => {
            // Legacy method, kept for compatibility but Grants should be preferred
            const db = localStorageRepository.load();
            if (!db.attendanceRecords) return;
            const record = db.attendanceRecords.find(r => r.id === recordId);
            if (record) {
                record.isLocked = isLocked;
                localStorageRepository.save(db);
            }
        },
        // NEW: Grant specific access
        grantEditAccess: (scheduleId: string, date: string, allowedUntil: string) => {
            const db = localStorageRepository.load();
            if (!db.attendanceRecords) return;
            const record = db.attendanceRecords.find(r => r.scheduleId === scheduleId && r.date === date);
            if (record) {
                record.allowedUntil = allowedUntil;
                localStorageRepository.save(db);
            }
        }
    },

    attendanceRequests: {
        add: (req: AttendanceRequest) => {
            const db = localStorageRepository.load();
            if (!db.attendanceRequests) db.attendanceRequests = [];
            db.attendanceRequests.push(req);

            // Notify Approver (Mocking logic: if HOD, notify HOD users; if Principal, notify Principal)
            // For simplicity in this demo, we can't easily find "The" Principal without more context, 
            // but we can create a notification directed to the role.
            // In a real app, we'd query users by role and institute.

            // Example Notification (Mock)
            const notification: Notification = {
                id: Date.now().toString(),
                userId: req.approverRole === 'HOD' ? 'hod_user' : 'principal_user', // Placeholder
                title: "New Attendance Edit Request",
                message: `Request for ${req.date} - ${req.reason.substring(0, 20)}...`,
                type: "REQUEST",
                link: "/principal/attendance", // Or wherever the request manager is
                isRead: false,
                createdAt: new Date().toISOString()
            };
            // Note: We need a way to actually save this. 
            // Calling the notification service here or just exposing it.
            if (!db.notifications) db.notifications = [];
            db.notifications.push(notification);
            localStorageRepository.save(db);
        },
        getAll: () => {
            const db = localStorageRepository.load();
            return db.attendanceRequests || [];
        },
        updateStatus: (id: string, status: 'APPROVED' | 'REJECTED', note?: string, allowedUntil?: string) => {
            const db = localStorageRepository.load();
            if (!db.attendanceRequests) return;
            const req = db.attendanceRequests.find(r => r.id === id);
            if (req) {
                req.status = status;
                req.decisionNote = note;
                req.decidedAt = new Date().toISOString();
                req.allowedUntil = allowedUntil;

                // If Approved, Apply Grant to Attendance Record
                if (status === 'APPROVED' && allowedUntil) {
                    const record = db.attendanceRecords?.find(
                        r => r.scheduleId === req.scheduleId && r.date === req.date
                    );
                    if (record) {
                        record.allowedUntil = allowedUntil;
                        // Note: We leave isLocked = true. The grant overrides strict lock check.
                    }
                }

                // Notify Requester (Teacher)
                const notification: Notification = {
                    id: Date.now().toString(),
                    userId: req.requesterId,
                    title: `Attendance Request ${status}`,
                    message: `Your request for ${req.date} has been ${status.toLowerCase()}. ${note ? `Note: ${note}` : ''}`,
                    type: status === 'APPROVED' ? 'APPROVAL' : 'INFO',
                    link: "/teacher/lectures",
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                if (!db.notifications) db.notifications = [];
                db.notifications.push(notification);

                localStorageRepository.save(db);
            }
        }
    },

    notifications: {
        getAll: () => { // debug/admin use
            const db = localStorageRepository.load();
            return db.notifications || [];
        },
        getForUser: (userId: string) => {
            const db = localStorageRepository.load();
            // In this mock, we might handle role-based or id-based. 
            // Ideally userId matches. For "Principal", we might show all 'principal_user' ones.
            return (db.notifications || []).filter(n => n.userId === userId || n.userId === 'all');
        },
        markAsRead: (id: string) => {
            const db = localStorageRepository.load();
            if (!db.notifications) return;
            const notif = db.notifications.find(n => n.id === id);
            if (notif) {
                notif.isRead = true;
                localStorageRepository.save(db);
            }
        },
        add: (notification: Notification) => {
            const db = localStorageRepository.load();
            if (!db.notifications) db.notifications = [];
            db.notifications.push(notification);
            localStorageRepository.save(db);
        }
    }
};

export interface AttendanceRecord {
    id: string;
    scheduleId: string;
    date: string; // YYYY-MM-DD
    teacherId: string;
    students: { studentId: string; status: 'Present' | 'Absent' }[];
    isLocked: boolean;
    submittedAt: string;
    allowedUntil?: string; // ISO Datetime string. If present and future, allows edit even if locked.
}

export interface AttendanceRequest {
    id: string;
    requesterId: string;
    scheduleId: string;
    date: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approverRole: 'HOD' | 'PRINCIPAL';
    createdAt: string;
    decisionNote?: string;
    decidedAt?: string;
    allowedUntil?: string; // The time limit granted
}

export interface Notification {
    id: string;
    userId: string; // Target user ID
    title: string;
    message: string;
    type: 'INFO' | 'REQUEST' | 'APPROVAL' | 'WARNING';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

