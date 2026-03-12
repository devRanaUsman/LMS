import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireRole } from '@/RBAC/RequireRole';

// Mock the hook used by RequireRole
vi.mock('@/RBAC/canMethod', () => {
    return {
        useCurrentRole: vi.fn()
    };
});

import { useCurrentRole } from '@/RBAC/canMethod';

describe('RequireRole', () => {
    it('redirects unauthorized users', () => {
        // Mock unauthorized
        (useCurrentRole as any).mockReturnValue('STUDENT');

        const { queryByText } = render(
            <MemoryRouter initialEntries={['/principal']}>
                <Routes>
                    <Route path="/principal" element={<RequireRole role="PRINCIPAL" redirectTo="/unauthorized" />}>
                        <Route index element={<div>Principal Secret</div>} />
                    </Route>
                    <Route path="/unauthorized" element={<div>Access Denied</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(queryByText('Principal Secret')).toBeNull();
    });

    it('allows authorized users', () => {
        // Mock authorized
        (useCurrentRole as any).mockReturnValue('PRINCIPAL');

        const { getByText } = render(
            <MemoryRouter initialEntries={['/principal']}>
                <Routes>
                    <Route path="/principal" element={<RequireRole role="PRINCIPAL" />}>
                        <Route index element={<div>Principal Secret</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(getByText('Principal Secret')).toBeInTheDocument();
    });
});
