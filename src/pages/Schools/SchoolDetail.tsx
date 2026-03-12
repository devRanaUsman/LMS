import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCurrentRole } from "@/RBAC/canMethod";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "react-toastify";
import { isUniversityLike } from "@/utils/schoolHelpers";
import {
    MapPin, Users, Calendar, Shield,
    FileText, Download, Edit, UserPlus, AlertTriangle, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AssignPrincipalModal } from "@/components/School/AssignPrincipalModal";
import { K12Section } from "@/components/School/K12Section";
import { HigherEdSection } from "@/components/School/HigherEdSection";
import { Button } from "@/components/ui/button";
import { institutionService } from "@/services/institutionService";
import { principalService } from "@/services/principalService";
import { retirementService } from "@/services/retirementService";
import { type PrincipalHistory } from "@/types/principal";
import { PrincipalHistoryTimeline } from "@/components/School/PrincipalHistoryTimeline";

interface SchoolDetails {
    id: string;
    name: string;
    emisCode: string;
    registrationDate: string;
    vertical: "School" | "College" | "University";
    subType?: "Post-Graduate" | "Undergraduate" | "Technical" | "K-12";
    status: "Active" | "Inactive";
    assignmentStatus: "Pending Assignment" | "Active" | "Inactive";
    address: {
        district: string;
        tehsil: string;
        coords: { lat: number; lng: number };
    };
    principal?: {
        id: string;
        name: string;
        cnic: string;
        email: string;
        photoUrl?: string;
    };
    subAuthority: { name: string; role: string }[];
    globalPolicies: string[];
    // Higher Ed
    departments?: { name: string; hod: string; hodEmail?: string }[];
    // K-12
    grades?: { name: string; sections: string[] }[];
    medium?: "English" | "Urdu" | "Regional Language";
}

export default function SchoolDetails() {
    const { schoolId } = useParams<{ schoolId: string }>();
    // const navigate = useNavigate();
    const currentRole = useCurrentRole();
    const [school, setSchool] = useState<SchoolDetails | null>(null);
    const [history, setHistory] = useState<PrincipalHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPrincipalModal, setShowPrincipalModal] = useState(false);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const { user } = usePermissions();

    // Permissions
    const canAssign = true; // In real app: useCan("schools.manage")

    // Use schoolId from param if available, otherwise fallback to id (if checking legacy routes)
    const id = schoolId;

    useEffect(() => {
        if (id) {
            setSchool(null);
            setIsLoading(true);

            // Parallel Fetch
            Promise.all([
                institutionService.getInstitution(id),
                principalService.getHistory(id)
            ]).then(([repoData, historyData]) => {
                if (repoData) {
                    // Map Repository Data to UI State
                    const mappedSchool: SchoolDetails = {
                        id: repoData.emisCode, // ID is EMIS in this simple version
                        name: repoData.name,
                        emisCode: repoData.emisCode,
                        registrationDate: repoData.createdAt.split('T')[0],
                        vertical: repoData.verticalType === "K12" ? "School" : repoData.verticalType === "COLLEGE" ? "College" : "University",
                        subType: "K-12", // Default for now
                        status: repoData.status === "INACTIVE" ? "Inactive" : "Active",
                        assignmentStatus: repoData.status === "PENDING_ASSIGNMENT" ? "Pending Assignment" : "Active",
                        address: {
                            district: "Lahore",
                            tehsil: "City",
                            coords: repoData.gps
                        },
                        // In a real app we would fetch the principal user details here if ID exists
                        principal: repoData.principalId ? {
                            id: repoData.principalId,
                            name: "Dr. Sarah Ahmed", // Mock Name as data doesn't have it
                            cnic: "35202-1234567-1",
                            email: "dr.sarah.ahmed@gov.pk"
                        } : undefined,
                        subAuthority: [
                            { name: "Mr. Kamran", role: "Vice Principal" },
                            { name: "Ms. Hina", role: "Admin Officer" }
                        ],
                        globalPolicies: ["Biometric Attendance 2024", "Standard Uniform Policy"],
                        medium: "English",
                        // Mock Grades for UI
                        grades: [
                            { name: "Grade 1", sections: ["A", "B"] },
                            { name: "Grade 2", sections: ["A", "B", "C"] },
                            { name: "Grade 9", sections: ["Science", "Arts"] },
                            { name: "Grade 10", sections: ["Science", "Arts"] }
                        ]
                    };
                    setSchool(mappedSchool);
                }
                setHistory(historyData);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
        }
    }, [id]);

    const handleAssignPrincipal = async (user: any, justification?: string) => {
        if (!school || !id) return;

        try {
            const actorId = "current_user_id"; // Mock ID

            if (school.principal) {
                // Retirement + Assignment
                if (!justification) {
                    toast.error("Justification is required for replacement.");
                    return;
                }
                await principalService.replacePrincipal(id, school.principal.id, user, justification, actorId);
                toast.success(`Succession Complete: ${school.principal.name} retired. ${user.name} assigned.`);
            } else {
                // Direct Assignment
                await principalService.assignDirectly(id, user, actorId);
                toast.success(`Assigned ${user.name} as Principal`);
            }

            // Refresh Data Locally
            const updatedSchool = { ...school };
            updatedSchool.principal = {
                id: user.id,
                name: user.name,
                cnic: "35202-0000000-0",
                email: user.email
            };
            updatedSchool.assignmentStatus = "Active";

            setSchool(updatedSchool);

            // Refresh History
            const newHistory = await principalService.getHistory(id);
            setHistory(newHistory);

            setShowPrincipalModal(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to assign principal");
        }
    };

    const handleRequestRetirement = async () => {
        if (!school?.principal) return;
        const reason = prompt("Please provide a reason for retirement (min 5 chars):");
        if (!reason || reason.length < 5) {
            toast.error("Valid reason is required.");
            return;
        }

        try {
            await retirementService.createRequest(school.id, school.principal.id, school.principal.name, reason);
            toast.success("Retirement request submitted successfully.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading school details...</div>;
    if (!school) return <div className="p-8 text-center text-red-500">School not found</div>;

    const isMissingPrincipal = !school.principal;
    // const verticalLabel = school.subType || getVerticalLabel(school.vertical); // Helper might not accept string "School", checking logic
    const verticalLabel = school.vertical;
    const isHigherEdContent = isUniversityLike(school.vertical);


    // Debugging role issues
    const isPrincipal = currentRole === "PRINCIPAL" || user?.role === "PRINCIPAL";
    // Also check for case-insensitivity just in case
    const isPrincipalLoose = isPrincipal || user?.role?.toUpperCase() === "PRINCIPAL";

    return (
        <div className="space-y-6 pb-10 max-w-[1600px] mx-auto">
            <PageHeader
                breadcrumb={[
                    isPrincipalLoose
                        ? { label: 'Dashboard', to: '/' }
                        : { label: 'Schools', to: '/schools' },
                    { label: school.name }
                ]}
                title={
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-slate-900">{school.name}</span>
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-medium">{school.id}</span>
                    </div>
                }
                description={
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${school.assignmentStatus === "Pending Assignment" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                            {school.assignmentStatus}
                        </span>
                        <span className="text-slate-400 text-sm">•</span>
                        <span className="text-slate-600 text-sm font-medium">{verticalLabel}</span>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                        {canAssign && !isPrincipalLoose && (
                            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-lg border border-slate-200">
                                <Button
                                    onClick={() => setShowPrincipalModal(true)}
                                    variant={isMissingPrincipal ? "default" : "outline"}
                                    className={isMissingPrincipal ? "animate-pulse" : "bg-white"}
                                    leftIcon={<UserPlus className="w-4 h-4" />}
                                    tooltip={isMissingPrincipal ? "Assign a principal to this institution" : "Replace current principal"}
                                >
                                    {isMissingPrincipal ? "Assign Principal" : "Replace Principal"}
                                </Button>
                                <Button
                                    onClick={() => toast.info("Edit mode not implemented in details view")}
                                    variant="outline"
                                    className="bg-white"
                                    leftIcon={<Edit className="w-4 h-4" />}
                                    tooltip="Edit school details"
                                >
                                    Edit
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-slate-400 hover:text-slate-600"
                            tooltip="Download Report"
                        >
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
                }
            />

            {/* Warning Banner */}
            {isMissingPrincipal && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-yellow-800 text-sm">Action Required</h4>
                        <p className="text-yellow-700 text-sm mt-1">This school is not yet operational. Please assign a Principal to begin data syncing.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col - Identity & Location */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-400" />
                                Identity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">EMIS Code</p>
                                    <p className="font-mono text-sm font-medium">{school.emisCode}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Vertical</p>
                                    <p className="text-sm font-medium">{school.vertical}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Medium</p>
                                    <p className="text-sm font-medium">{school.medium || "Not Specified"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Registration Date</p>
                                    <p className="text-sm font-medium">{school.registrationDate}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{school.address.tehsil}, {school.address.district}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-500 font-mono">{school.address.coords.lat}, {school.address.coords.lng}</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${school.address.coords.lat},${school.address.coords.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                                    >
                                        View on Maps <MapPin className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            {school.address.coords.lat && school.address.coords.lng ? (
                                <div className="mt-4">
                                    <iframe
                                        src={`https://www.google.com/maps?q=${school.address.coords.lat},${school.address.coords.lng}&z=15&output=embed`}
                                        width="100%"
                                        height="300"
                                        style={{ border: 0, borderRadius: '0.5rem' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="School Location Map"
                                        className="shadow-sm"
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                                    <p className="text-sm text-slate-400">No coordinates available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Col - Governance */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    Governance
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {/* Principal Profile */}
                            <div className={`rounded-lg p-4 border relative ${school.principal ? "bg-slate-50" : "bg-yellow-50/50 border-yellow-200 border-dashed"}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Principal</p>
                                </div>
                                {school.principal ? (
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                                            {school.principal.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{school.principal.name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{school.principal.email}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">CNIC: {school.principal.cnic}</p>

                                            {/* Retirement Trigger - Module 1B */}
                                            {currentRole === "PRINCIPAL" && (
                                                <Button
                                                    size="sm"
                                                    onClick={handleRequestRetirement}
                                                    className="mt-3 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 text-xs h-8"
                                                    tooltip="Submit a formal retirement request"
                                                >
                                                    Request Retirement
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border shadow-sm">
                                            <UserPlus className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">No Principal Assigned</h4>
                                            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">This school is in draft state. Assign a principal to activate operations.</p>
                                        </div>
                                        {canAssign && (
                                            <Button
                                                size="sm"
                                                onClick={() => setShowPrincipalModal(true)}
                                                className="mt-2 text-xs h-8"
                                                tooltip="Assign a principal to activate operations"
                                            >
                                                Assign Principal
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tenure History - The New Component */}
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                                        <History className="w-4 h-4" />
                                        Tenure History
                                    </p>
                                    {history.length > 0 && (
                                        <Button
                                            variant="link"
                                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                            className="text-xs text-blue-600 h-auto p-0"
                                            tooltip={isHistoryExpanded ? "Collapse tenure history" : "View complete tenure history"}
                                        >
                                            {isHistoryExpanded ? "Collapse" : "View All"}
                                        </Button>
                                    )}
                                </div>

                                {isHistoryExpanded || history.length <= 1 ? (
                                    <PrincipalHistoryTimeline history={history} />
                                ) : (
                                    // Show simplified recent only if not expanded
                                    <PrincipalHistoryTimeline history={history.slice(0, 1)} />
                                )}
                            </div>

                            {/* Sub Authority */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Sub-Authority Team</p>
                                <div className="space-y-3">
                                    {school.subAuthority.map((member, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-slate-700">{member.name}</span>
                                            <span className="text-slate-500 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{member.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col - Operations & Vertical Specific */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Operational Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Weekly Attendance</p>
                                {school.assignmentStatus === "Pending Assignment" ? (
                                    <div className="h-32 bg-yellow-50/50 rounded-lg flex flex-col items-center justify-center border border-dashed border-yellow-200 gap-2 p-4">
                                        <AlertTriangle className="w-8 h-8 text-yellow-400" />
                                        <p className="text-xs text-yellow-700 font-medium text-center">No Data Available</p>
                                        <p className="text-[10px] text-yellow-600 text-center">Assign a Principal to start collecting attendance data</p>
                                    </div>
                                ) : (
                                    <div className="h-24 bg-blue-50/50 rounded-lg flex items-end justify-between px-4 pb-2 pt-4 border border-blue-100 gap-1">
                                        <div className="w-1/6 bg-blue-300 rounded-t h-[40%]" />
                                        <div className="w-1/6 bg-blue-300 rounded-t h-[60%]" />
                                        <div className="w-1/6 bg-blue-400 rounded-t h-[80%]" />
                                        <div className="w-1/6 bg-blue-500 rounded-t h-[95%]" />
                                        <div className="w-1/6 bg-blue-400 rounded-t h-[70%]" />
                                        <div className="w-1/6 bg-blue-300 rounded-t h-[50%]" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Active Policies</p>
                                <div className="flex flex-wrap gap-2">
                                    {school.globalPolicies.map(p => (
                                        <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isHigherEdContent ? (
                        <HigherEdSection
                            vertical={school.vertical}
                            subType={school.subType}
                            departments={school.departments}
                        />
                    ) : (
                        <K12Section grades={school.grades} />
                    )}
                </div>
            </div>

            <AssignPrincipalModal
                isOpen={showPrincipalModal}
                onClose={() => setShowPrincipalModal(false)}
                onAssign={handleAssignPrincipal}
                currentPrincipalId={school.principal?.id}
                schoolName={school.name}
            />
        </div>
    );
}
