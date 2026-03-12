import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localStorageRepository } from "../services/localStorageRepository";
import { type Class } from "../types/hierarchy";

export default function DepartmentClasses() {
    const { deptId } = useParams();
    const navigate = useNavigate();
    const [classes, setClasses] = useState<Class[]>([]);
    const [deptName, setDeptName] = useState("");

    useEffect(() => {
        if (!deptId) return;
        const dept = localStorageRepository.departments.getById(deptId);
        if (dept) setDeptName(dept.name);

        const cls = localStorageRepository.classes.getByDepartment(deptId);
        setClasses(cls);
    }, [deptId]);

    return (
        <div className="p-6 space-y-6">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 mb-4">
                ← Back to Departments
            </button>

            <header>
                <h1 className="text-2xl font-bold text-gray-900">{deptName} - Classes</h1>
                <p className="text-gray-500">Select a class to view details.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(c => (
                    <div
                        key={c.id}
                        onClick={() => navigate(`/classes/detail/${c.id}`)}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition cursor-pointer"
                    >
                        <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-500">ID: {c.id}</p>
                        <div className="mt-4 flex justify-end">
                            <span className="text-indigo-600 text-sm font-medium">View Plan →</span>
                        </div>
                    </div>
                ))}

                {classes.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No classes found in this department.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
