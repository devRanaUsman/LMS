import React, { useState } from 'react';
import { type Teacher } from '@/types/hierarchy';
import { Modal } from '@/components/ui/Modal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { localStorageRepository } from '@/services/localStorageRepository';

interface AddTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (teacher: Omit<Teacher, 'id' | 'punctuality' | 'deliveryRate' | 'totalWorkload' | 'joiningDate' | 'monthlyAttendance' | 'scheduledHours' | 'actualHours'>) => void;
    userRole: 'PRINCIPAL' | 'HOD';
    userDepartment?: string;
    institutionType: 'UNIVERSITY' | 'SCHOOL' | 'COLLEGE';
}

export function AddTeacherModal({
    isOpen,
    onClose,
    onSubmit,
    userRole,
    userDepartment,
    // institutionType, // Removed unused variable
}: AddTeacherModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        departmentId: userRole === 'HOD' ? userDepartment || '' : '',
        designation: '',
        specialization: '',
        type: 'NORMAL' as 'NORMAL' | 'HOD',
    });

    const departments = localStorageRepository.departments.getAll();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.departmentId) newErrors.departmentId = 'Department is required';
        if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            departmentId: userRole === 'HOD' ? userDepartment || '' : '',
            designation: '',
            specialization: '',
            type: 'NORMAL',
        });
        setErrors({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Teacher"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-slate-200'
                            }`}
                        placeholder="Enter teacher's full name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-slate-200'
                            }`}
                        placeholder="teacher@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>

                {/* Department */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Department <span className="text-red-500">*</span>
                    </label>
                    {userRole === 'HOD' ? (
                        <input
                            type="text"
                            value={formData.departmentId}
                            disabled
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                        />
                    ) : (
                        <>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(val: string) => setFormData({ ...formData, departmentId: val })}
                            >
                                <SelectTrigger className={`h-9 ${errors.departmentId ? 'border-red-300' : ''}`}>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.length === 0 ? (
                                        <SelectItem value="empty" disabled>No departments found</SelectItem>
                                    ) : (
                                        departments.map(dept => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.departmentId && <p className="mt-1 text-xs text-red-500">{errors.departmentId}</p>}
                        </>
                    )}
                </div>

                {/* Specialization */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className={`w-full h-9 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.specialization ? 'border-red-300' : 'border-slate-200'
                            }`}
                        placeholder="e.g., Data Structures, Algebra, Quantum Physics"
                    />
                    {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization}</p>}
                </div>

                {/* Designation */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Designation
                    </label>
                    <Select
                        value={formData.designation}
                        onValueChange={(val: string) => setFormData({ ...formData, designation: val })}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Professor">Professor</SelectItem>
                            <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                            <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                            <SelectItem value="Lecturer">Lecturer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Role Type
                    </label>
                    <Select
                        value={formData.type}
                        onValueChange={(val: string) => setFormData({ ...formData, type: val as 'NORMAL' | 'HOD' })}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NORMAL">Faculty</SelectItem>
                            <SelectItem value="HOD">Head of Department</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="h-9 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add Teacher
                    </button>
                </div>
            </form>
        </Modal>
    );
}
