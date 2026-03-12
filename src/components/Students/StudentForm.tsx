import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FormInput } from "../ui/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { localStorageRepository } from "../../services/localStorageRepository";

const studentSchema = z.object({
    firstName: z.string().min(2, "First Name is required (min 2 characters)"),
    lastName: z.string().min(2, "Last Name is required (min 2 characters)"),
    rollNumber: z.string().min(2, "Roll Number is required"),
    email: z.string().email("Valid email address required"),
    phone: z.string().min(10, "Valid phone number required"),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    dateOfBirth: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    classId: z.string().min(1, "Class is required"),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    addressLine1: z.string().optional(),
    city: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
    onSubmit: (data: StudentFormValues) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
}

export function StudentForm({ onSubmit, isSubmitting = false, onCancel }: StudentFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema)
    });



    // Get departments and classes for dropdowns
    const departments = localStorageRepository.departments.getAll();
    const classes = localStorageRepository.classes.getAll();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Summary Alert */}
            {/* {hasErrors && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-red-900 mb-1">
                                Form Validation Failed
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                                {Object.entries(errors).map(([key, error]) => (
                                    <li key={key} className="flex items-center gap-2 text-xs text-red-700">
                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                        <span>{error?.message as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )} */}

            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Personal Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="firstName"
                        label="First Name"
                        required
                        placeholder="e.g. Ali"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                    />
                    <FormInput
                        id="lastName"
                        label="Last Name"
                        required
                        placeholder="e.g. Khan"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        required
                        placeholder="e.g. ali.khan@example.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <FormInput
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        required
                        placeholder="e.g. +92 300 1234567"
                        error={errors.phone?.message}
                        {...register("phone")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        id="rollNumber"
                        label="Roll Number / Admission No"
                        required
                        placeholder="FA21-BSE-123"
                        error={errors.rollNumber?.message}
                        {...register("rollNumber")}
                    />

                    <div className="space-y-2">
                        <Label>Gender</Label>
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <FormInput
                        id="dateOfBirth"
                        label="Date of Birth (Optional)"
                        type="date"
                        error={errors.dateOfBirth?.message}
                        {...register("dateOfBirth")}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Academic Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Controller
                            name="departmentId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Class / Section</Label>
                        <Controller
                            name="classId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.classId && <p className="text-xs text-red-500">{errors.classId.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Guardian Details (Optional)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="guardianName"
                        label="Guardian Name"
                        placeholder="e.g. Aslam Khan"
                        error={errors.guardianName?.message}
                        {...register("guardianName")}
                    />
                    <FormInput
                        id="guardianPhone"
                        label="Guardian Phone"
                        type="tel"
                        placeholder="e.g. +92 300 7654321"
                        error={errors.guardianPhone?.message}
                        {...register("guardianPhone")}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Address (Optional)</h2>

                <FormInput
                    id="addressLine1"
                    label="Address Line 1"
                    placeholder="Street address..."
                    error={errors.addressLine1?.message}
                    {...register("addressLine1")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id="city"
                        label="City"
                        placeholder="e.g. Lahore"
                        error={errors.city?.message}
                        {...register("city")}
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Student"}
                </Button>
            </div>
        </form>
    );
}
