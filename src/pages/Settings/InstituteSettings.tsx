import { useState, useEffect } from "react";
import { localStorageRepository } from "@/services/localStorageRepository";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "react-toastify";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/ErrorState";
import { normalizeError } from "@/utils/errorUtils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InstituteSettings() {
    const { user } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [closeTime, setCloseTime] = useState("");
    const [institution, setInstitution] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const schoolId = (user as any).schoolId || 1;
            const allInstitutions = localStorageRepository.institutions.getAll();
            const found = allInstitutions.find(i => i.id == schoolId) || allInstitutions[0];

            if (found) {
                setInstitution(found);
                setCloseTime(found.settings?.closeTime || "");
            } else {
                throw new Error("Institution not found");
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
            setError(normalizeError(err, "We couldn't fetch the institute settings. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleSave = () => {
        if (!institution) return;
        if (!closeTime) {
            toast.error("Please enter a valid closing time.");
            return;
        }

        setSaving(true);
        try {
            // Update local state object
            const updatedInstitution = {
                ...institution,
                settings: {
                    ...institution.settings,
                    closeTime
                }
            };

            // Persist
            localStorageRepository.institutions.update(updatedInstitution);
            setInstitution(updatedInstitution);
            toast.success("Institute settings saved successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
    }

    if (error) {
        return <ErrorState title="Unable to load settings" message={error} variant="page" onRetry={loadData} showRefreshPage={true} />;
    }

    if (!institution) {
        return <div className="p-8 text-center text-red-500">Institution not found.</div>;
    }

    return (
        <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Institute Configuration</h2>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Operating Hours
                    </CardTitle>
                    <CardDescription>
                        Configure when the institute automatically closes for the day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 w-32">
                        <Label htmlFor="closeTime">
                            Institute Close Timing
                        </Label>
                        <Input
                            type="time"
                            id="closeTime"
                            step="1"
                            value={closeTime}
                            onChange={(e) => setCloseTime(e.target.value)}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        <p className="text-[10px] text-slate-500 w-max mt-1">
                            This time is used to determine late check-ins and auto-locking features.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            isLoading={saving}
                            leftIcon={<Save className="w-4 h-4" />}
                            tooltip="Save configuration changes"
                        >
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
