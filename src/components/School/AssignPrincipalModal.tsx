import { useState, useEffect } from "react";
import { X, Search, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "../ui/button"; // Corrected import path assuming standard setup
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Mock Users
const MOCK_USERS: User[] = [
    { id: "u1", name: "Dr. Ahmed Ali", email: "ahmed.ali@edu.pk", role: "Principal" },
    { id: "u2", name: "Ms. Sarah Khan", email: "sarah.khan@edu.pk", role: "Principal" },
    { id: "u5", name: "Dr. Hassan Raza", email: "hassan.raza@edu.pk", role: "Principal" },
    { id: "u6", name: "Mrs. Aisha Malik", email: "aisha.malik@edu.pk", role: "Principal" },
    { id: "u3", name: "Mr. John Doe", email: "john.doe@edu.pk", role: "Vice Principal" },
    { id: "u4", name: "Mrs. Fatima Bibi", email: "fatima.bibi@edu.pk", role: "Senior Teacher" },
];

interface AssignPrincipalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (user: User, justification?: string) => void;
    currentPrincipalId?: string;
    schoolName: string;
}

export function AssignPrincipalModal({ isOpen, onClose, onAssign, currentPrincipalId, schoolName }: AssignPrincipalModalProps) {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [justification, setJustification] = useState("");
    const [step, setStep] = useState<"SEARCH" | "RETIRE_JUSTIFICATION">("SEARCH");

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setSelectedId(null);
            setJustification("");
            // If there IS a current principal, we still start at SEARCH to find the new one, 
            // BUT we will need a justification step before confirming.
            setStep("SEARCH");
        }
    }, [isOpen]);

    const principalUsers = MOCK_USERS.filter(u => u.role === "Principal");
    const filteredUsers = principalUsers.filter(u =>
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())) &&
        u.id !== currentPrincipalId // Exclude current principal from list to prevent re-assignment loop
    );

    const handleNextOrSubmit = () => {
        if (!selectedId) return;

        // If replacing an existing principal, require justification step
        if (currentPrincipalId && step === "SEARCH") {
            setStep("RETIRE_JUSTIFICATION");
            return;
        }

        // Final Submit
        const user = MOCK_USERS.find(u => u.id === selectedId);
        if (user) {
            onAssign(user, justification);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-700">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-in-out border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">
                            {currentPrincipalId ? "Replace Principal (Succession)" : "Assign Principal"}
                        </h3>
                        <p className="text-xs text-slate-500">{schoolName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-0">
                    {step === "SEARCH" && (
                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="border rounded-md h-[250px] overflow-y-auto custom-scrollbar">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No eligible candidates found.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => setSelectedId(user.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-slate-50",
                                                    selectedId === user.id && "bg-blue-50/80 hover:bg-blue-50 border-l-4 border-blue-600 pl-2"
                                                )}
                                            >
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                                {selectedId === user.id && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "RETIRE_JUSTIFICATION" && (
                        <div className="p-6 space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800 text-sm">Retirement Confirmation Required</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Assigning a new principal will automatically <strong>RETIRE</strong> the current principal. This action is auditable.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Justification for Replacement <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                    placeholder="E.g., Reached retirement age, Transferred to another district..."
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 text-right">
                                    Min 5 characters
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-between items-center gap-2">
                    {step === "RETIRE_JUSTIFICATION" ? (
                        <Button variant="ghost" onClick={() => setStep("SEARCH")}>Back</Button>
                    ) : (
                        <Button variant="ghost" onClick={onClose} className="bg-white hover:bg-slate-100 border">Cancel</Button>
                    )}

                    <Button
                        onClick={handleNextOrSubmit}
                        disabled={
                            !selectedId ||
                            (step === "RETIRE_JUSTIFICATION" && justification.length < 5)
                        }
                        className={cn(
                            "text-white transition-all",
                            step === "RETIRE_JUSTIFICATION" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {step === "RETIRE_JUSTIFICATION" ? "Confirm Replacement" : (currentPrincipalId ? "Next: Justification" : "Assign Selected")}
                        {currentPrincipalId && step === "SEARCH" && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
