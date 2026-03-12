import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dashboardService } from '@/services/dashboardService';

describe('Principal Dashboard Integration Flows', () => {

    // We rely on the internal state of dashboardService which persists across tests in the same file 
    // unless we had a reset method. Since it's a singleton export, we must be careful with order 
    // or add a reset mechanism. For this "Simulation", we'll just run sequential checks.

    it('Flow 1: Leave Approval updates KPI logic', async () => {
        // Initial State
        const initialStats = await dashboardService.getPrincipalStats();
        const initialLeaves = initialStats.pendingActions.leaves;
        const initialPresence = initialStats.studentPresence.present;

        // Find a pending leave
        const leaves = await dashboardService.getLeaves();
        const pendingStudentLeave = leaves.find(l => l.status === 'Pending' && l.type === 'Student');

        expect(pendingStudentLeave).toBeDefined();
        if (!pendingStudentLeave) return;

        // Approve it
        await dashboardService.processLeave(pendingStudentLeave.id, 'Approved');

        // Check Stats Update
        const newStats = await dashboardService.getPrincipalStats();

        // Pending Actions should decrease
        expect(newStats.pendingActions.leaves).toBe(initialLeaves - 1);

        // Student Presence KPI should INCREASE (because we treat approved as "Effective Present")
        expect(newStats.studentPresence.present).toBeGreaterThan(initialPresence);
    });

    it('Flow 2: Assign Schedule Proxy', async () => {
        const date = new Date().toISOString();
        const slotId = 2; // Linear Algebra (from mock)
        const teacherId = 999;

        // Initial check: no proxy
        const scheduleBefore = await dashboardService.getSchedule(0, date);
        const targetSlotBefore = scheduleBefore.find(s => s.id === slotId);
        expect(targetSlotBefore?.proxyTeacherId).toBeUndefined();

        // Assign Proxy
        await dashboardService.assignScheduleProxy(slotId, teacherId, date);

        // Check update
        const scheduleAfter = await dashboardService.getSchedule(0, date);
        const targetSlotAfter = scheduleAfter.find(s => s.id === slotId);

        expect(targetSlotAfter?.proxyTeacherId).toBe(teacherId);
        expect(targetSlotAfter?.isProxyToday).toBe(true);
    });

    it('Flow 3: Attendance Marking removes item from Pending list', async () => {
        // Get Pending list
        const pendingBefore = await dashboardService.getPendingAttendance();
        const classToMark = pendingBefore[0];
        expect(classToMark).toBeDefined();
        if (!classToMark) return;

        // Mark it
        await dashboardService.markAttendance(classToMark.id, [{ studentId: 1, status: 'Present' }]);

        // Check Pending list again
        const pendingAfter = await dashboardService.getPendingAttendance();
        const found = pendingAfter.find(c => c.id === classToMark.id);

        expect(found).toBeUndefined(); // Should be gone
    });

    it('Flow 4: Sub-Role Creation (HOD Context)', async () => {
        const newHOD = {
            name: "Dr. New HOD",
            email: "newhod@uni.edu",
            role: "HOD" as const,
            context: "Physics"
        };

        await dashboardService.createSubUser(newHOD);

        const users = await dashboardService.getSubUsers();
        const created = users.find(u => u.email === newHOD.email);

        expect(created).toBeDefined();
        expect(created?.role).toBe("HOD");
        expect(created?.context).toBe("Physics");
    });
});
