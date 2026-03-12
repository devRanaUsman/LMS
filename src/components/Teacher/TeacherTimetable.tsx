import React from "react";
import { type Schedule } from "@/types/hierarchy";

interface TeacherTimetableProps {
    schedules: Schedule[];
}

export function TeacherTimetable({ schedules }: TeacherTimetableProps) {
    // Visual Timetable Helper
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "01:00", "02:00"];

    const getScheduleForSlot = (day: string, timePrefix: string) => {
        return schedules.find(s => s.day === day && s.startTime.startsWith(timePrefix));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Digital Timetable</h3>
            <div className="overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-6 border-l border-t border-gray-200">
                    {/* Header Row */}
                    <div className="p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase border-r border-b border-gray-200">Time / Day</div>
                    {days.map(day => (
                        <div key={day} className="p-4 bg-gray-50 text-xs font-bold text-center text-gray-500 uppercase border-r border-b border-gray-200">
                            {day}
                        </div>
                    ))}

                    {/* Rows */}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div className="p-4 text-xs font-medium text-gray-500 border-r border-b border-gray-200">
                                {time}
                            </div>
                            {days.map(day => {
                                const session = getScheduleForSlot(day, time.split(":")[0]); // Simple prefix match
                                return (
                                    <div key={`${day}-${time}`} className="p-2 border-r border-b border-gray-200 min-h-[80px]">
                                        {session ? (
                                            <div className="h-full bg-indigo-50 border border-indigo-100 rounded p-2 text-xs">
                                                <div className="font-bold text-indigo-700">{session.subjectId}</div>
                                                <div className="text-indigo-500 mt-1">{session.classId}</div>
                                            </div>
                                        ) : (
                                            <div className="h-full bg-gray-50/30"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
