
import { ScheduleMatrix } from "@/components/Dashboard/ScheduleMatrix";
import { CreditHourTracker } from "@/components/Dashboard/CreditHourTracker";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function AcademicView() {
    // Determine institution type (mocked as per dashboard)
    const [institutionType] = useState<"UNIVERSITY" | "COLLEGE" | "SCHOOL">("UNIVERSITY");

    return (
        <div className="space-y-6">
            <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Academic Matrix' }]} />
            <Card> <h1 className="text-2xl pt-5 px-6 font-bold text-slate-900">Academic & Schedule Matrix</h1>


                <CardContent className="pt-6">
                    <ScheduleMatrix institutionType={institutionType} />
                </CardContent>
            </Card>

            {(institutionType === "UNIVERSITY" || institutionType === "COLLEGE") && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Credit Hour Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreditHourTracker />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
