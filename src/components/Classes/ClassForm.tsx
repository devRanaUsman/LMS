import { useForm, Controller, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FormInput } from "../ui/FormInput";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { localStorageRepository } from "../../services/localStorageRepository";
import { type Class } from "../../types/hierarchy";
import { VerticalType, GradeLevel } from "../../types/institution";
import { useEffect } from "react";
import { academicService } from "../../services/academicService";

const createSchema = (isUniversity: boolean, mode: "create" | "manage" = "create") => z.object({
    departmentId: z.string().optional(),
    name: mode === "create" ? (isUniversity ? z.string().min(2, "Class Name is required") : z.string().optional()) : z.string().optional(),
    classId: mode === "manage" ? z.string().min(1, "Class is required") : z.string().optional(),
    gradeLevel: mode === "create" ? (isUniversity ? z.string().optional() : z.string().min(1, "Grade Level is required")) : z.string().optional(),
    section: mode === "create" ? (isUniversity ? z.string().optional() : z.string().min(1, "Section Name is required")) : z.string().optional(),
    classTeacherId: mode === "create" ? z.string().min(1, "Teacher / Advisor is required") : z.string().optional(),
    subjects: z.array(z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1, "Subject name cannot be empty")
    })).min(1, "At least one subject is required")
        .refine((subjects) => {
            const names = subjects.map(s => s.name.toLowerCase());
            return new Set(names).size === names.length;
        }, "Subjects must be unique"),
});

interface ClassFormProps {
    verticalType: VerticalType;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    onCancel: () => void;
    hideDepartment?: boolean;
    mode?: "create" | "manage";
    availableClasses?: Class[];
}

export function ClassForm({ verticalType, onSubmit, isSubmitting = false, onCancel, hideDepartment = false, mode = "create", availableClasses = [] }: ClassFormProps) {
    const isUniversity = verticalType === VerticalType.UNIVERSITY;
    const isK12 = verticalType === VerticalType.K12;

    const schema = createSchema(isUniversity, mode);
    type ClassFormValues = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ClassFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            subjects: [{ name: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "subjects"
    });

    const selectedClassId = watch("classId");

    useEffect(() => {
        if (mode === "manage" && selectedClassId) {
            academicService.getSubjectsByClass(selectedClassId).then(subs => {
                if (subs.length > 0) {
                    setValue("subjects", subs.map(s => ({ id: s.id, name: s.name })));
                } else {
                    setValue("subjects", [{ name: "" }]);
                }
            });
        }
    }, [selectedClassId, mode, setValue]);

    const hasErrors = Object.keys(errors).length > 0;

    // Get departments and teachers for dropdowns
    const departments = localStorageRepository.departments.getAll();
    const teachers = localStorageRepository.teachers.getAll();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Summary Alert */}
            {hasErrors && (
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
            )}

            <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-700 border-none pb-2">{mode === "create" ? "Class Details" : "Select Class"}</h2>

                {mode === "manage" && (
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Controller
                            name="classId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableClasses.map((cls) => (
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
                )}

                {isUniversity && mode === "create" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!hideDepartment && (
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
                        )}

                        <FormInput
                            id="name"
                            label="Class Name"
                            required
                            placeholder="e.g. BSCS-Sem-1"
                            error={errors.name?.message}
                            {...register("name")}
                        />
                    </div>
                )}

                {isK12 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Grade Level</Label>
                            <Controller
                                name="gradeLevel"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={GradeLevel.PRIMARY}>Primary</SelectItem>
                                            <SelectItem value={GradeLevel.MIDDLE}>Middle</SelectItem>
                                            <SelectItem value={GradeLevel.HIGH}>High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.gradeLevel && <p className="text-xs text-red-500">{errors.gradeLevel.message}</p>}
                        </div>

                        <FormInput
                            id="section"
                            label="Section Name"
                            required
                            placeholder="e.g. A, Red, Eagles"
                            error={errors.section?.message}
                            {...register("section")}
                        />
                    </div>
                )}

                {mode === "create" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{isK12 ? "Class Teacher (Incharge)" : "Advisor / Coordinator"}</Label>
                            <Controller
                                name="classTeacherId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map(teacher => (
                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.classTeacherId && <p className="text-xs text-red-500">{errors.classTeacherId.message}</p>}
                        </div>
                    </div>
                )}

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center pb-2">
                        <Label className="text-base font-semibold text-slate-700 border-none">Subjects</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-slate-300"
                            onClick={() => append({ name: "" })}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Subject
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-3">
                                <div className="flex-1">
                                    <Input
                                        id={`subjects.${index}.name`}
                                        placeholder="e.g. Mathematics"
                                        className={errors.subjects?.[index]?.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        {...register(`subjects.${index}.name` as const)}
                                    />
                                    {errors.subjects?.[index]?.name && (
                                        <p className="text-[10px] text-red-500 mt-1 pl-1">
                                            {errors.subjects[index]?.name?.message}
                                        </p>
                                    )}
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {errors.subjects && !Array.isArray(errors.subjects) && (
                        <p className="text-xs text-red-500">{errors.subjects.message}</p>
                    )}
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : mode === "create" ? "Create Class" : "Save Subjects"}
                </Button>
            </div>
        </form>
    );
}
