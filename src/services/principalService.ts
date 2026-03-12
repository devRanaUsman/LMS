import { type PrincipalHistory } from "../types/principal";
import { type AuditLog } from "../types/audit";

// Mock Data Stores
let principalHistoryStore: PrincipalHistory[] = [
    {
        id: "hist_1",
        schoolId: "SCH-1002",
        principalId: "u5",
        principalName: "Dr. Hassan Raza",
        status: "RETIRED",
        startDate: "2020-01-01T00:00:00Z",
        endDate: "2023-05-15T00:00:00Z",
        justification: "Reached retirement age",
        assignedBy: "admin_1",
        retiredBy: "admin_1"
    }
];

let auditLogStore: AuditLog[] = [];

export const principalService = {
    // Fetch history for a school
    getHistory: async (schoolId: string): Promise<PrincipalHistory[]> => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay
        return principalHistoryStore
            .filter(h => h.schoolId === schoolId)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    },

    // Transactional: Retire current -> Assign new
    replacePrincipal: async (
        schoolId: string,
        currentPrincipalId: string,
        newPrincipal: { id: string; name: string; email: string },
        justification: string,
        actorId: string
    ): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!justification || justification.length < 5) {
            throw new Error("A valid justification is required to retire a principal.");
        }

        const timestamp = new Date().toISOString();

        // 1. Retire Current Principal
        // Find if there's an active record? In this mock we just append a new "RETIRED" record 
        // representing the closing of the previous tenure if we were tracking it statefully.
        // For simplicity, we assume the current one was "active" since unknown start date, 
        // so we just log this retirement to history now.

        const retirementRecord: PrincipalHistory = {
            id: `hist_${Date.now()}_retire`,
            schoolId,
            principalId: currentPrincipalId,
            principalName: "(Previous Principal)", // In real app, fetch name
            status: "RETIRED",
            startDate: "2023-01-01T00:00:00Z", // Mock start date
            endDate: timestamp,
            justification,
            assignedBy: "system_legacy",
            retiredBy: actorId
        };
        principalHistoryStore.push(retirementRecord);

        // Audit Log for Retirement
        auditLogStore.push({
            id: `audit_${Date.now()}_1`,
            actorId,
            action: "RETIRE_PRINCIPAL",
            targetId: schoolId,
            timestamp,
            metadata: {
                principalId: currentPrincipalId,
                reason: justification
            }
        });

        // 2. Assign New Principal
        const newRecord: PrincipalHistory = {
            id: `hist_${Date.now()}_assign`,
            schoolId,
            principalId: newPrincipal.id,
            principalName: newPrincipal.name,
            status: "ACTIVE",
            startDate: timestamp,
            assignedBy: actorId
        };
        principalHistoryStore.push(newRecord);

        // Audit Log for Assignment
        auditLogStore.push({
            id: `audit_${Date.now()}_2`,
            actorId,
            action: "ASSIGN_PRINCIPAL",
            targetId: schoolId,
            timestamp,
            metadata: {
                newPrincipalId: newPrincipal.id,
                name: newPrincipal.name
            }
        });

        console.log("Transaction Complete: Principal Replaced", { retirementRecord, newRecord });
    },

    // First time assignment (no retirement needed)
    assignDirectly: async (
        schoolId: string,
        newPrincipal: { id: string; name: string; email: string },
        actorId: string
    ): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));

        const timestamp = new Date().toISOString();

        const newRecord: PrincipalHistory = {
            id: `hist_${Date.now()}_assign`,
            schoolId,
            principalId: newPrincipal.id,
            principalName: newPrincipal.name,
            status: "ACTIVE",
            startDate: timestamp,
            assignedBy: actorId
        };
        principalHistoryStore.push(newRecord);

        auditLogStore.push({
            id: `audit_${Date.now()}`,
            actorId,
            action: "ASSIGN_PRINCIPAL",
            targetId: schoolId,
            timestamp,
            metadata: {
                newPrincipalId: newPrincipal.id,
                name: newPrincipal.name
            }
        });

        console.log("Direct Assignment Complete", newRecord);
    }
};
