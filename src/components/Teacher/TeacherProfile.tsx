import { type Teacher } from "@/types/hierarchy";

interface TeacherProfileProps {
    teacher: Teacher;
}

export function TeacherProfile({ teacher }: TeacherProfileProps) {
    return (
        <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/20">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{teacher.name}</h1>
                        <p className="text-indigo-200 text-lg">{teacher.specialization} • {teacher.type === "HOD" ? "Head of Department" : "Faculty Member"}</p>

                        <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-indigo-100/80">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {teacher.email}
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {teacher.phone}
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Joined {teacher.joiningDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Monthly Attendance */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Monthly Attendance</div>
                    <div className="text-3xl font-bold text-gray-900">{teacher.monthlyAttendance}%</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${teacher.monthlyAttendance}%` }}></div>
                    </div>
                </div>

                {/* Scheduled Hours */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Scheduled Hours</div>
                    <div className="text-3xl font-bold text-gray-900">{teacher.scheduledHours}</div>
                    <div className="text-xs text-gray-400 mt-1">Target Met</div>
                </div>

                {/* Actual Delivered */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Actual Delivered</div>
                    <div className={`text-3xl font-bold ${teacher.actualHours < teacher.scheduledHours ? 'text-red-500' : 'text-gray-900'}`}>
                        {teacher.actualHours}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Hours logged</div>
                </div>

                {/* Punctuality Score */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Punctuality Score</div>
                    <div className="text-3xl font-bold text-blue-600">{teacher.punctuality}%</div>
                    <div className="text-xs text-gray-400 mt-1">Average arrival time</div>
                </div>
            </div>
        </div>
    );
}
