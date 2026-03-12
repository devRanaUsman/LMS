import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { retirementService } from "@/services/retirementService";
import { localStorageRepository } from "@/services/localStorageRepository";
import { type RetirementRequest } from "@/types/principal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ArrowLeft, CheckCircle, UserPlus, AlertCircle, Building, Clock, Award } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "@/components/ui/Loader";

// Mock "Vice Principals" generator
const getPotentialSuccessors = (_schoolId: string) => [
    { id: "vp_1", name: "Sarah Khan", role: "Vice Principal", tenure: "5 years", education: "M.Ed" },
    { id: "hod_1", name: "Ali Raza", role: "Snr. HOD Science", tenure: "8 years", education: "Ph.D Physics" },
    { id: "vp_2", name: "Fatima Bibi", role: "Vice Principal (Admin)", tenure: "3 years", education: "M.Phil" },
];

export default function RetirementApproval() {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<RetirementRequest | null>(null);
    const [schoolName, setSchoolName] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [selectedAction, setSelectedAction] = useState<"PROMOTE" | "EXTERNAL" | null>(null);
    const [selectedSuccessor, setSelectedSuccessor] = useState<string | null>(null);
    const [justification, setJustification] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const successors = request ? getPotentialSuccessors(request.schoolId) : [];

    useEffect(() => {
        if (requestId) loadData(requestId);
    }, [requestId]);

    const loadData = async (requestId: string) => {
        try {
            const req = await retirementService.getRequestById(requestId);
            if (!req) {
                toast.error("Request not found");
                navigate("/authority/inbox");
                return;
            }
            setRequest(req);

            const school = localStorageRepository.institutions.findByEmis("EMIS-1001");
            setSchoolName(school?.name || `School ${req.schoolId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAction) return;
        if (!justification || justification.length < 10) {
            toast.warning("Please provide a detailed justification (min 10 chars).");
            return;
        }
        if (selectedAction === "PROMOTE" && !selectedSuccessor) {
            toast.warning("Please select a successor to promote.");
            return;
        }

        setIsSubmitting(true);
        try {
            const successor = successors.find(s => s.id === selectedSuccessor);

            await retirementService.approveRetirement(request!.id, selectedAction, {
                justification,
                actorId: "authority_user",
                newPrincipalId: selectedAction === "PROMOTE" ? selectedSuccessor! : undefined,
                newPrincipalName: selectedAction === "PROMOTE" ? successor?.name : undefined
            });

            toast.success("Retirement Approved & Processed");
            navigate("/authority/inbox");
        } catch (error: any) {
            toast.error(error.message || "Failed to process request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !request) return <Loader variant="page" text="Loading request details..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/authority/inbox")} tooltip="Back to inbox">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Retirement Application Review</h1>
                    <p className="text-sm text-slate-500">Ref: {request.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT: Retiring Principal Profile */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-orange-400">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                Retiring Principal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 border-2 border-white shadow-sm">
                                    {request.principalName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{request.principalName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Building className="w-4 h-4" />
                                        {schoolName}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Clock className="w-4 h-4" />
                                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="text-sm font-medium text-slate-700 mb-2">Service Highlights (Mock)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Tenure</p>
                                        <p className="font-semibold text-slate-900">12 Years</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Performance Rating</p>
                                        <p className="font-semibold text-green-600">Exceptional (4.8)</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 uppercase">Reason for Retirement</p>
                                        <p className="text-sm text-slate-800 italic mt-1">"{request.reason}"</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT: Succession Planning */}
                <div className="space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="w-5 h-5 text-blue-500" />
                                Succession Decision
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 flex-1">
                            {/* Action Selector */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => { setSelectedAction("PROMOTE"); setSelectedSuccessor(null); }}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center space-y-2 ${selectedAction === "PROMOTE" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}
                                >
                                    <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserPlus className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="font-medium text-slate-900">Internal Promotion</h4>
                                    <p className="text-xs text-slate-500">Promote a VP or HOD</p>
                                </div>

                                <div
                                    onClick={() => setSelectedAction("EXTERNAL")}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center space-y-2 ${selectedAction === "EXTERNAL" ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-300"}`}
                                >
                                    <div className="w-10 h-10 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h4 className="font-medium text-slate-900">Approve & Search</h4>
                                    <p className="text-xs text-slate-500">Post vacancy for external</p>
                                </div>
                            </div>

                            {/* Conditional: Internal Candidates */}
                            {selectedAction === "PROMOTE" && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h4 className="text-sm font-medium text-slate-700">Recommended Successors</h4>
                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                                        {successors.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => setSelectedSuccessor(s.id)}
                                                className={`p-3 rounded-md border cursor-pointer flex justify-between items-center ${selectedSuccessor === s.id ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "hover:bg-slate-50"}`}
                                            >
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900">{s.name}</p>
                                                    <p className="text-xs text-slate-500">{s.role} • {s.tenure} exp.</p>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 rounded-full border bg-white text-slate-600">{s.education}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Conditional: External Justification Hint */}
                            {selectedAction === "EXTERNAL" && (
                                <div className="p-3 bg-purple-50 text-purple-700 text-sm rounded-md border border-purple-200 animate-in fade-in">
                                    You are approving the retirement + vacancy.
                                </div>
                            )}

                            {/* Justification Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Decision Justification (Mandatory)</label>
                                <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Explain why this action is being taken..."
                                    className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </CardContent>

                        <div className="p-6 border-t bg-slate-50 rounded-b-lg flex justify-end gap-3">
                            <Button variant="outline" onClick={() => navigate("/authority/inbox")} tooltip="Cancel review">Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedAction || !justification}
                                isLoading={isSubmitting}
                                className={selectedAction === "PROMOTE" ? "bg-blue-600" : selectedAction === "EXTERNAL" ? "bg-purple-600" : ""}
                                tooltip="Submit your decision for this retirement request"
                            >
                                Confirm Decision
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
