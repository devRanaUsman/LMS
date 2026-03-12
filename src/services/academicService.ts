import { localStorageRepository } from "./localStorageRepository";
import { type Class, type Subject, type Schedule, type DayOfWeek, type TeacherRequest } from "../types/hierarchy";

export const academicService = {
    // 1. Manage Classes
    getClasses: async (departmentId: string): Promise<Class[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return localStorageRepository.classes.getByDepartment(departmentId);
    },

    createClass: async (departmentId: string, name: string): Promise<Class> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const newClass: Class = {
            id: `class_${Date.now()}`,
            departmentId,
            name
        };
        localStorageRepository.classes.add(newClass);
        return newClass;
    },

    // 2. Manage Subjects
    getSubjects: async (departmentId: string): Promise<Subject[]> => {
        return localStorageRepository.subjects.getByDepartment(departmentId);
    },

    getSubjectsByClass: async (classId: string): Promise<Subject[]> => {
        return localStorageRepository.subjects.getByClass(classId);
    },

    createSubject: async (departmentId: string, name: string, classId?: string): Promise<Subject> => {
        const newSub: Subject = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            departmentId,
            name,
            classId
        };
        localStorageRepository.subjects.add(newSub);
        return newSub;
    },

    // 3. Scheduling with Conflict Detection
    getAllSchedules: async (): Promise<Schedule[]> => {
        return localStorageRepository.schedules.getAll();
    },

    getSchedules: async (classId: string): Promise<Schedule[]> => {
        return localStorageRepository.schedules.getByClass(classId);
    },

    scheduleLecture: async (
        classId: string,
        subjectId: string,
        day: DayOfWeek,
        startTime: string,
        endTime: string,
        teacherId?: string
    ): Promise<Schedule> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Validation: Start < End
        if (startTime >= endTime) {
            throw new Error("End time must be after start time");
        }

        // Simple Conflict Detection: A class cannot have two lectures at the same time
        const classSchedules = localStorageRepository.schedules.getByClass(classId);
        const daySchedules = classSchedules.filter(s => s.day === day);

        const hasConflict = daySchedules.some(existing => {
            // Overlap check: (newStart < existingEnd) && (newEnd > existingStart)
            return (startTime < existing.endTime) && (endTime > existing.startTime);
        });

        if (hasConflict) {
            throw new Error(`Conflict: This class is already scheduled at this time.`);
        }

        let teacherName = undefined;
        if (teacherId) {
            const rawTeacher = localStorageRepository.teachers.getById(teacherId);
            if (rawTeacher) {
                teacherName = rawTeacher.name;
            }
        }

        const newSchedule: Schedule = {
            id: `sch_${Date.now()}`,
            classId,
            subjectId,
            teacherId,
            teacherName,
            day,
            startTime,
            endTime
        };

        localStorageRepository.schedules.add(newSchedule);
        return newSchedule;
    },

    // 4. Teacher Requests
    getTeacherRequestsToDept: async (departmentId: string): Promise<TeacherRequest[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return localStorageRepository.teacherRequests.getByToDepartment(departmentId);
    },

    createTeacherRequest: async (
        fromDepartmentId: string,
        toDepartmentId: string,
        requestedTeacherId: string,
        classId: string,
        subjectId: string,
        day: DayOfWeek,
        startTime: string,
        endTime: string,
        note?: string
    ): Promise<TeacherRequest> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const teacher = localStorageRepository.teachers.getById(requestedTeacherId);
        if (!teacher) throw new Error("Teacher not found");

        const newReq: TeacherRequest = {
            id: `treq_${Date.now()}`,
            fromDepartmentId,
            toDepartmentId,
            requestedTeacherId,
            requestedTeacherName: teacher.name,
            classId,
            subjectId,
            day,
            startTime,
            endTime,
            status: "PENDING",
            note,
            createdAt: new Date().toISOString()
        };

        localStorageRepository.teacherRequests.add(newReq);
        return newReq;
    },

    updateTeacherRequestStatus: async (
        requestId: string,
        status: "APPROVED" | "REJECTED"
    ): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const requests = localStorageRepository.teacherRequests.getAll();
        const req = requests.find(r => r.id === requestId);
        if (!req) throw new Error("Request not found");

        if (status === "APPROVED") {
            // Internally schedule the lecture if approved (simplified to omit teacher for now)
            await academicService.scheduleLecture(
                req.classId,
                req.subjectId,
                req.day,
                req.startTime,
                req.endTime
            );
        }

        req.status = status;
        localStorageRepository.teacherRequests.update(req);
    }
};
