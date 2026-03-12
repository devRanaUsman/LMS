export interface AuditLog {
    id: string;
    actorId: string;
    action: "RETIRE_PRINCIPAL" | "ASSIGN_PRINCIPAL" | "SCHOOL_UPDATE" | "RETIRE_REQUEST" | "APPROVE_RETIREMENT" | "PROMOTE_PRINCIPAL";
    targetId: string; // e.g., School ID
    timestamp: string;
    metadata?: {
        reason?: string;
        previousPrincipalId?: string;
        newPrincipalId?: string;
        [key: string]: any;
    };
}
