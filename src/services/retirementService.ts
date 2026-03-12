import { localStorageRepository } from "./localStorageRepository";
import { type RetirementRequest, type PrincipalHistory } from "../types/principal";
import { type AuditLog } from "../types/audit";

export const retirementService = {
    // 1. Principal: Setup Retirement Request
    createRequest: async (schoolId: string, principalId: string, principalName: string, reason: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));

        // Check for existing pending request
        const existing = localStorageRepository.retirementRequests.getAll()
            .find(r => r.principalId === principalId && r.status === "PENDING");

        if (existing) {
            throw new Error("You already have a pending retirement request.");
        }

        const newRequest: RetirementRequest = {
            id: `req_${Date.now()}`,
            schoolId,
            principalId,
            principalName,
            reason,
            status: "PENDING",
            requestDate: new Date().toISOString()
        };

        localStorageRepository.retirementRequests.add(newRequest);

        // Audit Log
        const audit: AuditLog = {
            id: `audit_${Date.now()}`,
            actorId: principalId,
            action: "RETIRE_REQUEST",
            targetId: newRequest.id,
            timestamp: newRequest.requestDate,
            metadata: { reason }
        };
        localStorageRepository.auditLogs.add(audit);
    },

    // 2. Authority: List Inbox
    getPendingRequests: async (): Promise<RetirementRequest[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return localStorageRepository.retirementRequests.getAll()
            .filter(r => r.status === "PENDING")
            .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    },

    getRequestById: async (requestId: string): Promise<RetirementRequest | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return localStorageRepository.retirementRequests.findById(requestId);
    },

    // 3. Authority: Approve & Succession
    approveRetirement: async (
        requestId: string,
        action: "PROMOTE" | "EXTERNAL",
        successionDetails: {
            newPrincipalId?: string; // If Promote
            newPrincipalName?: string;
            justification: string;
            actorId: string;
        }
    ): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const request = localStorageRepository.retirementRequests.findById(requestId);
        if (!request) throw new Error("Request not found");
        if (request.status !== "PENDING") throw new Error("Request is not pending");

        const timestamp = new Date().toISOString();

        // Transaction Steps:

        // A. Update Request Status
        request.status = "APPROVED";
        localStorageRepository.retirementRequests.update(request);

        // B. Audit Log (Approval)
        localStorageRepository.auditLogs.add({
            id: `audit_${Date.now()}_approve`,
            actorId: successionDetails.actorId,
            action: "APPROVE_RETIREMENT",
            targetId: requestId,
            timestamp,
            metadata: { justification: successionDetails.justification }
        });

        // C. Retire Old Principal (History)
        const retirementHistory: PrincipalHistory = {
            id: `hist_${Date.now()}_ret`,
            schoolId: request.schoolId,
            principalId: request.principalId,
            principalName: request.principalName,
            status: "RETIRED",
            startDate: "2020-01-01T00:00:00Z", // Mock start date for unknown tenure
            endDate: timestamp,
            justification: `Retirement Approved: ${successionDetails.justification}`,
            assignedBy: "system_legacy",
            retiredBy: successionDetails.actorId
        };
        localStorageRepository.principalHistory.add(retirementHistory);

        // D. Assign New Principal (If Promotion)
        if (action === "PROMOTE" && successionDetails.newPrincipalId && successionDetails.newPrincipalName) {
            const newHistory: PrincipalHistory = {
                id: `hist_${Date.now()}_new`,
                schoolId: request.schoolId,
                principalId: successionDetails.newPrincipalId,
                principalName: successionDetails.newPrincipalName,
                status: "ACTIVE",
                startDate: timestamp,
                assignedBy: successionDetails.actorId
            };
            localStorageRepository.principalHistory.add(newHistory);

            // Audit
            localStorageRepository.auditLogs.add({
                id: `audit_${Date.now()}_promote`,
                actorId: successionDetails.actorId,
                action: "PROMOTE_PRINCIPAL",
                targetId: request.schoolId,
                timestamp,
                metadata: {
                    newPrincipalId: successionDetails.newPrincipalId,
                    name: successionDetails.newPrincipalName
                }
            });

            // Note: In a real app we would update the School.principal object too, 
            // but our repository for institutions doesn't granularly update that yet 
            // without a full fetch-modify-save of the institution list. 
            // For now, the History is the source of truth for "Past Leaders".
        }
    }
};
