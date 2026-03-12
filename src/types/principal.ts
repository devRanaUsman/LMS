export type PrincipalStatus = "ACTIVE" | "RETIRED";
export const PrincipalStatus = {
    ACTIVE: "ACTIVE" as PrincipalStatus,
    RETIRED: "RETIRED" as PrincipalStatus
};

export interface PrincipalHistory {
    id: string;
    schoolId: string;
    principalId: string;
    principalName: string;
    status: PrincipalStatus;
    startDate: string;
    endDate?: string; // If retired
    justification?: string; // For retirement
    assignedBy: string; // Actor ID
    retiredBy?: string; // Actor ID
}

export interface RetirementRequest {
    id: string;
    schoolId: string;
    principalId: string;
    principalName: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestDate: string;
}
