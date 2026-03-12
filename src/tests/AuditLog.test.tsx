import { describe, it, expect, beforeEach } from 'vitest';
import { dashboardService, type SubmittedClass } from '@/services/dashboardService';

describe('dashboardService Security & Audit', () => {
    // Reset or mock state if needed. 
    // Since service uses in-memory module-level variables, we might strictly need to 
    // rely on its public API or add a reset method for tests.
    // For this mock, we assume fresh start or robust tests.

    it('should allow modifying unlocked attendance without a reason', async () => {
        // Mock a pending/unlocked class
        // Trigger update
        // Expect no error
        // Ideally we'd mock the 'getSubmittedAttendance' to return a specific unlocked class
        // But since we are integration testing the mock service, we rely on its internal 'today' vs 'yesterday' logic
        // Today's classes are UNLOCKED.
        const todayClassId = 101;
        await expect(dashboardService.updateAttendance(todayClassId, [], 1)).resolves.not.toThrow();
    });

    it('should FAIL to modify LOCKED attendance without a reason', async () => {
        const lockedClassId = 102; // Yesterday's class in mock
        await expect(dashboardService.updateAttendance(lockedClassId, [], 1))
            .rejects
            .toThrow("Attendance is locked. A reason is required to override.");
    });

    it('should generate an AUDIT LOG when overriding a lock', async () => {
        const lockedClassId = 102;
        const reason = "Test Override Reason";
        const principalId = 999;

        await dashboardService.updateAttendance(lockedClassId, [], principalId, reason);

        const logs = await dashboardService.getAuditLogs();
        const latestLog = logs[0]; // Logic unshifts to top

        expect(latestLog).toBeDefined();
        expect(latestLog.reason).toBe(reason);
        expect(latestLog.principalId).toBe(principalId);
        expect(latestLog.action).toBe("ATTENDANCE_OVERRIDE");
        expect(latestLog.entityId).toBe(lockedClassId);
    });
});
