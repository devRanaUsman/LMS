import { type CreateInstitutionRequest, type Institution, InstitutionStatus } from "../types/institution";
import { localStorageRepository } from "./localStorageRepository";

export const institutionService = {
    checkEmisAvailability: async (emisCode: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network debounce
        const existing = localStorageRepository.institutions.findByEmis(emisCode);
        return !existing;
    },

    createInstitution: async (data: CreateInstitutionRequest): Promise<Institution> => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network

        // Backend Hard Validation (even though we have LS, we simulate server logic)
        const existing = localStorageRepository.institutions.findByEmis(data.emisCode);
        if (existing) {
            throw new Error("EMIS Code already exists (Server Side Validation Failed)");
        }

        const newInstitution: Institution = {
            id: Date.now(),
            ...data,
            status: InstitutionStatus.PENDING_ASSIGNMENT,
            createdAt: new Date().toISOString()
        };

        localStorageRepository.institutions.add(newInstitution);
        console.log("New Institution Persisted:", newInstitution);
        return newInstitution;
    },

    getAllInstitutions: async (): Promise<Institution[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return localStorageRepository.institutions.getAll();
    },

    getInstitution: async (id: string): Promise<Institution | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        // Id passed from URL is EMIS code based on SchoolList logic
        const local = localStorageRepository.institutions.findByEmis(id);
        if (local) return local;

        // Fallback to static data
        const { getSchoolById } = await import("@/data/schools");
        const staticSchool = getSchoolById(id);

        if (staticSchool) {
            return {
                id: staticSchool.id as any, // ID type mismatch handling
                emisCode: staticSchool.id, // Using ID as EMIS code for static data
                name: staticSchool.name,
                verticalType: staticSchool.level === 'College' ? 'COLLEGE' : 'K12',
                status: staticSchool.status === 'Active' ? InstitutionStatus.ACTIVE :
                    staticSchool.status === 'Pending' ? InstitutionStatus.PENDING_ASSIGNMENT :
                        InstitutionStatus.INACTIVE,
                gps: { lat: 31.5204, lng: 74.3587 }, // Default coords for static data
                address: staticSchool.address || "No Address Provided",
                city: staticSchool.city,
                details: {}, // Empty details for static data
                createdAt: staticSchool.createdAt,
                principalId: staticSchool.principalId || undefined
            };
        }
        return undefined;
    }
};
