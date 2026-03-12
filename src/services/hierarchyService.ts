import { localStorageRepository } from "./localStorageRepository";
import { type Department, type Teacher } from "../types/hierarchy";

export const hierarchyService = {
    // 1. Get all departments for a school
    getDepartments: async (schoolId: number): Promise<Department[]> => {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return localStorageRepository.departments.getAll().filter(d => d.schoolId === schoolId);
    },

    // 2. Create a new department (Principal only)
    createDepartment: async (schoolId: number, name: string, building: string): Promise<Department> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newDept: Department = {
            id: `dept_${Date.now()}`,
            schoolId,
            name,
            building
        };

        localStorageRepository.departments.add(newDept);

        // Log action
        localStorageRepository.auditLogs.add({
            id: `audit_${Date.now()}`,
            actorId: "principal_user", // Should be dynamic in real app
            action: "CREATE_DEPARTMENT" as any,
            targetId: newDept.id,
            timestamp: new Date().toISOString(),
            metadata: { name, building }
        });

        return newDept;
    },

    // 3. Get available teachers for HOD assignment
    getTeachers: async (): Promise<Teacher[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return localStorageRepository.teachers.getAll();
    },

    // 4. Assign HOD to a department (Principal only)
    // Constraint: 1 HOD per dept, 1 Teacher = 1 HOD max
    assignHOD: async (departmentId: string, teacherId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const departments = localStorageRepository.departments.getAll();
        const targetDept = departments.find(d => d.id === departmentId);

        if (!targetDept) throw new Error("Department not found");

        // Check if teacher is already an HOD elsewhere
        const alreadyHOD = departments.find(d => d.hodId === teacherId);
        if (alreadyHOD && alreadyHOD.id !== departmentId) {
            throw new Error(`This teacher is already the HOD of ${alreadyHOD.name}`);
        }

        const teacher = localStorageRepository.teachers.getById(teacherId);
        if (!teacher) throw new Error("Teacher not found");

        // Update Department
        targetDept.hodId = teacherId;
        localStorageRepository.departments.update(targetDept);

        // Grant Role (Implicit RBAC update)
        // In this mock, we update the "user" in localStorage if they are that teacher
        // (Simulating that the teacher now has HOD permissions when they log in)
        const currentUserStr = localStorage.getItem("user");
        if (currentUserStr) {
            const user = JSON.parse(currentUserStr);
            if (user.id === teacherId) {
                user.role = "HOD";
                localStorage.setItem("user", JSON.stringify(user));
            }
        }

        // Log action
        localStorageRepository.auditLogs.add({
            id: `audit_${Date.now()}`,
            actorId: "principal_user",
            action: "ASSIGN_HOD" as any,
            targetId: departmentId,
            timestamp: new Date().toISOString(),
            metadata: { teacherId, teacherName: teacher.name }
        });
    },

    // 5. Delete a department (Principal only)
    deleteDepartment: async (departmentId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 400));

        const department = localStorageRepository.departments.getById(departmentId);
        if (!department) throw new Error("Department not found");

        // Delete the department
        localStorageRepository.departments.delete(departmentId);

        // Log action
        localStorageRepository.auditLogs.add({
            id: `audit_${Date.now()}`,
            actorId: "principal_user",
            action: "DELETE_DEPARTMENT" as any,
            targetId: departmentId,
            timestamp: new Date().toISOString(),
            metadata: { name: department.name, building: department.building }
        });
    }
};
