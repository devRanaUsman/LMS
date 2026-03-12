export type VerticalType = "UNIVERSITY" | "COLLEGE" | "K12";
export const VerticalType = {
    UNIVERSITY: "UNIVERSITY" as VerticalType,
    COLLEGE: "COLLEGE" as VerticalType,
    K12: "K12" as VerticalType
};

export type InstitutionStatus = "PENDING_ASSIGNMENT" | "ACTIVE" | "INACTIVE";
export const InstitutionStatus = {
    PENDING_ASSIGNMENT: "PENDING_ASSIGNMENT" as InstitutionStatus,
    ACTIVE: "ACTIVE" as InstitutionStatus,
    INACTIVE: "INACTIVE" as InstitutionStatus
};

export type GradeLevel = "PRIMARY" | "MIDDLE" | "HIGH";
export const GradeLevel = {
    PRIMARY: "PRIMARY" as GradeLevel,
    MIDDLE: "MIDDLE" as GradeLevel,
    HIGH: "HIGH" as GradeLevel
};

export interface Institution {
    id: number;
    emisCode: string;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    city?: string;
    country?: string;
    gps: {
        lat: number;
        lng: number;
    };
    verticalType: VerticalType;
    status: InstitutionStatus;
    details: {
        initialDepartmentCount?: number; // Only for UNIVERSITY
        gradeRange?: GradeLevel;       // Only for K12
    };
    createdAt: string;
    principalId?: string;
    settings?: {
        closeTime?: string; // "HH:mm" format
    };
}

export interface CreateInstitutionRequest {
    emisCode: string;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    city?: string;
    country?: string;
    gps: {
        lat: number;
        lng: number;
    };
    verticalType: VerticalType;
    details: {
        initialDepartmentCount?: number;
        gradeRange?: GradeLevel;
    };
}
