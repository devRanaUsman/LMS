import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Teacher } from "../../types/hierarchy"; // We'll use the form values type for now
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FormInput } from "../ui/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { localStorageRepository } from "../../services/localStorageRepository";

const teacherSchema = z.object({
    firstName: z.string().min(2, "First Name is required (min 2 characters)"),
    lastName: z.string().min(2, "Last Name is required (min 2 characters)"),
    email: z.string().email("Valid email address required"),
    phone: z.string().min(10, "Valid phone number required"),
    password: z.string().min(6, "Password is required (min 6 characters)"),
    cnic: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    dateOfBirth: z.string().optional(),
    qualification: z.string().min(2, "Qualification is required"),
    specialization: z.string().min(2, "Subject/Specialization is required"),
    experienceYears: z.number().min(0).optional(),

    addressLine1: z.string().optional(),
    city: z.string().min(2, "City is required"),
    province: z.string().min(2, "Province is required"),
    country: z.string().min(2, "Country is required"),

    assignedInstitutionId: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
    onSubmit: (data: TeacherFormValues) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
}

export function TeacherForm({ onSubmit, isSubmitting = false, onCancel }: TeacherFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            country: "Pakistan",
            experienceYears: 0
        }
    });



    // Get institutions and departments for dropdowns
    const institutions = localStorageRepository.institutions.getAll();
    const departments = localStorageRepository.departments.getAll();

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        required
                        placeholder="Enter password"
                        error={errors.password?.message}
                        {...register("password")}
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
                        id="cnic"
                        label="CNIC (Optional)"
                        placeholder="42101-1234567-1"
                        error={errors.cnic?.message}
                        {...register("cnic")}
                    />
                    <FormInput
                        id="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        error={errors.dateOfBirth?.message}
                        {...register("dateOfBirth")}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Professional Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        id="qualification"
                        label="Qualification"
                        required
                        placeholder="e.g. MSc Physics"
                        error={errors.qualification?.message}
                        {...register("qualification")}
                    />
                    <FormInput
                        id="specialization"
                        label="Subject / Specialization"
                        required
                        placeholder="e.g. Physics"
                        error={errors.specialization?.message}
                        {...register("specialization")}
                    />
                    <FormInput
                        id="experienceYears"
                        label="Experience (Years)"
                        type="number"
                        min="0"
                        error={errors.experienceYears?.message}
                        {...register("experienceYears", { valueAsNumber: true })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Controller
                            name="departmentId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select Department" />
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
                            )}
                        />
                        {errors.departmentId && <p className="text-[10px] text-red-500">{errors.departmentId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Assigned Institution (Optional)</Label>
                        <Controller
                            name="assignedInstitutionId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutions.map(inst => (
                                            <SelectItem key={inst.id} value={String(inst.id)}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Address</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <FormInput
                            id="addressLine1"
                            label="Address Line 1"
                            placeholder="Street address..."
                            error={errors.addressLine1?.message}
                            {...register("addressLine1")}
                        />
                    </div>
                    <FormInput
                        id="city"
                        label="City"
                        required
                        placeholder="e.g. Lahore"
                        error={errors.city?.message}
                        {...register("city")}
                    />
                    <FormInput
                        id="province"
                        label="Province"
                        required
                        placeholder="e.g. Punjab"
                        error={errors.province?.message}
                        {...register("province")}
                    />
                    <FormInput
                        id="country"
                        label="Country"
                        required
                        placeholder="e.g. Pakistan"
                        error={errors.country?.message}
                        {...register("country")}
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Teacher"}
                </Button>
            </div>
        </form >
    );
}
