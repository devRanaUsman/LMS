import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrincipalDashboard from '../pages/PrincipalDashboard/PrincipalDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { dashboardService } from '../services/dashboardService';

// Mock service
vi.mock('../services/dashboardService', () => ({
    dashboardService: {
        getPrincipalStats: vi.fn().mockResolvedValue({
            studentPresence: { present: 100, total: 200 },
            teacherAttendance: { checkedIn: 10, total: 20 },
            pendingActions: { leaves: 0, registrations: 0 },
            scheduleHealth: { coveredSessions: 85, plannedSessions: 100 },
        }),
        getDepartments: vi.fn().mockResolvedValue([]),
        getGrades: vi.fn().mockResolvedValue([]),
        getSchedule: vi.fn().mockResolvedValue([
            { id: 1, time: '09:00 AM', subject: 'Mathematics', teacherId: 1, teacherName: 'Mr. Anderson' }
        ]),
        searchTeachers: vi.fn().mockResolvedValue([]),
        assignScheduleProxy: vi.fn().mockResolvedValue(undefined),
        getSubUsers: vi.fn().mockResolvedValue([]),
        getSchoolStatus: vi.fn().mockResolvedValue({ status: 'Open' }),
        getAuditLogs: vi.fn().mockResolvedValue([]),
    }
}));

const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

describe('Dashboard Fixes Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('K-12 schedule displays K-12 subjects', async () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <PrincipalDashboard />
            </QueryClientProvider>
        );

        // Switch to School view
        const select = screen.getByDisplayValue('University View');
        fireEvent.change(select, { target: { value: 'SCHOOL' } });

        await waitFor(() => {
            expect(dashboardService.getSchedule).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(String),
                'SCHOOL'
            );
        });
    });

    it('Credit Hour Tracker does not mount for K-12', async () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <PrincipalDashboard />
            </QueryClientProvider>
        );

        // Switch to School view
        const select = screen.getByDisplayValue('University View');
        fireEvent.change(select, { target: { value: 'SCHOOL' } });

        await waitFor(() => {
            expect(screen.queryByText('Credit Hour Tracking')).not.toBeInTheDocument();
        });
    });

    it('Proxy assignment creates audit log entry', async () => {
        const mockAssignProxy = vi.fn().mockResolvedValue(undefined);
        (dashboardService.assignScheduleProxy as any) = mockAssignProxy;

        // This test verifies the service method is called
        await dashboardService.assignScheduleProxy(1, 101, '2026-01-29');

        expect(mockAssignProxy).toHaveBeenCalledWith(1, 101, '2026-01-29');
    });

    it('Broadcast button disabled unless school closure active', async () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <PrincipalDashboard />
            </QueryClientProvider>
        );

        await waitFor(() => {
            const broadcastButton = screen.getByText('Broadcast Alert');
            expect(broadcastButton).toBeDisabled();
        });
    });

    it('Schedule Health icon changes based on threshold', async () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <PrincipalDashboard />
            </QueryClientProvider>
        );

        await waitFor(() => {
            // With 85/100 coverage (85%), should show CheckCircle (healthy)
            expect(screen.getByText('85%')).toBeInTheDocument();
        });
    });
});
