import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrincipalDashboard from '../pages/PrincipalDashboard/PrincipalDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock icons to avoid rendering issues if any
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        // Add specific mocks if needed, otherwise rely on actual
    };
});

// Mock service to avoid network calls
vi.mock('../services/dashboardService', () => ({
    dashboardService: {
        getPrincipalStats: vi.fn().mockResolvedValue({
            studentPresence: { present: 100, total: 200 },
            teacherAttendance: { checkedIn: 10, total: 20 },
            pendingActions: { leaves: 0, registrations: 0 },
            scheduleHealth: { coveredSessions: 10, plannedSessions: 10 },
        }),
        getDepartments: vi.fn().mockResolvedValue([]),
        getGrades: vi.fn().mockResolvedValue([]),
        getSchedule: vi.fn().mockResolvedValue([]),
        getSubUsers: vi.fn().mockResolvedValue([]),
    }
}));

// Setup QueryClient
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('Credit Hour Tracking Guard', () => {
    it('does not mount CreditHourTracker in K-12 view', async () => {
        const queryClient = createTestQueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <PrincipalDashboard />
            </QueryClientProvider>
        );

        // 1. Default should be UNIVERSITY -> Shows Credit Hour Tracking
        // We look for the header text
        await waitFor(() => {
            expect(screen.getByText('Principal Dashboard')).not.toBeNull();
        });

        // Use queryByText for optional elements
        expect(screen.queryByText('Credit Hour Tracking')).toBeInTheDocument();
        expect(screen.queryByText('Department & HOD')).toBeInTheDocument();

        // 2. Switch to SCHOOL (K-12)
        // Find the select element
        // The select has "Test Mode:" label nearby
        const select = screen.getByDisplayValue('University View'); // or role 'combobox' if implicit

        fireEvent.change(select, { target: { value: 'SCHOOL' } });

        // 3. Verify Changes
        await waitFor(() => {
            expect(screen.getByText('Grade & Section Management')).toBeInTheDocument();
        });

        // Credit Hour Tracking should be GONE (unmounted)
        expect(screen.queryByText('Credit Hour Tracking')).not.toBeInTheDocument();

        // 4. Switch back to COLLEGE
        fireEvent.change(select, { target: { value: 'COLLEGE' } });

        await waitFor(() => {
            expect(screen.queryByText('Credit Hour Tracking')).toBeInTheDocument();
        });
    });
});
