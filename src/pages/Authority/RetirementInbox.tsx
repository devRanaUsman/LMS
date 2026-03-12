import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { retirementService } from "@/services/retirementService";
import { type RetirementRequest } from "@/types/principal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, FileText, ChevronRight } from "lucide-react";

export default function RetirementInbox() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RetirementRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const data = await retirementService.getPendingRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading inbox...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                    <Inbox className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Retirement Requests</h1>
                    <p className="text-sm text-slate-500">Manage pending retirement applications from principals.</p>
                </div>
            </div>

            {requests.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                        <p className="text-slate-500 mt-1">There are no pending retirement requests at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => navigate(`/authority/retirement/${req.id}`)}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {(req.principalName || "U").charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{req.principalName || "Unknown Principal"}</h4>
                                        <p className="text-sm text-slate-500">School ID: {req.schoolId}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Pending Review</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-400">Requested on {new Date(req.requestDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600" tooltip="Review this retirement request">
                                    Review <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
