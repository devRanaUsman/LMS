import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerticalType, GradeLevel } from '../../types/institution';
import { institutionService } from '../../services/institutionService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card } from '../../components/ui/card';
import { LocationPicker } from '../../components/ui/LocationPicker';
import { FormInput } from '../../components/ui/FormInput';
import { PageHeader } from '../../components/ui/PageHeader';


// Updated Zod Schema - without department count, with location object
const institutionSchema = z.object({
    emisCode: z.string().min(3, "EMIS Code is required (minimum 3 characters)"),
    name: z.string().min(3, "Institution Name is required (minimum 3 characters)"),
    email: z.string().email("Valid email address required").optional().or(z.literal('')),
    phone: z.string().min(10, "Valid phone number required (minimum 10 digits)").optional().or(z.literal('')),

    // Location as object
    location: z.object({
        address: z.string().min(1, "Location is required"),
        placeId: z.string().optional(),
        lat: z.number(),
        lng: z.number(),
        city: z.string().optional(),
        country: z.string().optional(),
    }),
    verticalType: z.enum(["UNIVERSITY", "COLLEGE", "K12"] as const, {
        message: "Please select an institution type"
    } as any),

    // Note: initialDepartmentCount REMOVED

    gradeRange: z.enum(["PRIMARY", "MIDDLE", "HIGH"] as const).optional(),
}).superRefine((data, ctx) => {
    // Only validate grade range for K12
    if (data.verticalType === VerticalType.K12) {
        if (!data.gradeRange) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Grade Range is required for K-12 Schools",
                path: ["gradeRange"],
            });
        }
    }
});

type InstitutionFormValues = z.infer<typeof institutionSchema>;

export default function InstitutionOnboarding() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingEmis, setCheckingEmis] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<InstitutionFormValues>({
        resolver: zodResolver(institutionSchema),
        defaultValues: {
            verticalType: undefined,
            email: '',
            phone: '',
        },
        mode: "onChange"
    });

    // Watch vertical type to show/hide dynamic fields
    const selectedVertical = useWatch({ control, name: "verticalType" });

    const validateEmis = async (emis: string) => {
        if (!emis || emis.length < 3) return;
        setCheckingEmis(true);
        try {
            const isAvailable = await institutionService.checkEmisAvailability(emis);
            if (!isAvailable) {
                setError("emisCode", { type: "manual", message: "EMIS Code already taken" });
            } else {
                clearErrors("emisCode");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setCheckingEmis(false);
        }
    };

    const onSubmit = async (data: InstitutionFormValues) => {
        setIsSubmitting(true);
        try {
            // First re-check EMIS just in case
            const isAvailable = await institutionService.checkEmisAvailability(data.emisCode);
            if (!isAvailable) {
                setError("emisCode", { type: "manual", message: "EMIS Code already taken" });
                setIsSubmitting(false);
                return;
            }

            await institutionService.createInstitution({
                emisCode: data.emisCode,
                name: data.name,
                email: data.email || undefined,
                phone: data.phone || undefined,
                gps: { lat: data.location.lat, lng: data.location.lng },
                address: data.location.address,
                city: data.location.city,
                country: data.location.country,
                verticalType: data.verticalType,
                details: {
                    gradeRange: data.verticalType === VerticalType.K12 ? data.gradeRange : undefined,
                }
            });

            toast.success("Institution Created Successfully");
            navigate("/schools");
        } catch (error: any) {
            toast.error(error.message || "Failed to create institution");
        } finally {
            setIsSubmitting(false);
        }
    };

    // const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="space-y-6">
            <PageHeader
                breadcrumb={[
                    { label: 'Schools', to: '/schools' },
                    { label: 'Onboard New Institution' }
                ]}
                title="Onboard New Institution"
            />

            <div className="max-w-3xl mx-auto">
                <Card className="p-6 bg-white shadow-sm border border-slate-200">
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

                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Basic Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* EMIS Code */}
                                <FormInput
                                    id="emisCode"
                                    label="EMIS Code"
                                    required
                                    placeholder="e.g. EMIS-2024-001"
                                    error={errors.emisCode?.message}
                                    helperText={checkingEmis ? "Checking availability..." : undefined}
                                    {...register("emisCode", {
                                        onBlur: (e) => validateEmis(e.target.value)
                                    })}
                                />

                                {/* Institution Name */}
                                <FormInput
                                    id="name"
                                    label="Institution Name"
                                    required
                                    placeholder="e.g. Punjab University"
                                    error={errors.name?.message}
                                    {...register("name")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                {/* <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="contact@institution.edu"
                                    className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div> */}

                                {/* Phone */}
                                {/* <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    {...register("phone")}
                                    placeholder="+92 300 1234567"
                                    className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                            </div> */}
                            </div>

                            {/* Location Picker - Leaflet Integrated */}
                            <Controller
                                name="location"
                                control={control}
                                render={({ field }) => (
                                    <LocationPicker
                                        value={field.value || null}
                                        onChange={field.onChange}
                                        error={errors.location?.message || errors.location?.address?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Vertical Configuration */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-base font-semibold text-slate-700 border-none pb-2">Institution Type</h2>

                            <div className="space-y-2">
                                <Label>
                                    Vertical Type <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="verticalType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={errors.verticalType ? "border-red-500 focus:ring-red-500" : ""}>
                                                <SelectValue placeholder="Select Institution Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={VerticalType.UNIVERSITY}>University</SelectItem>
                                                <SelectItem value={VerticalType.COLLEGE}>College</SelectItem>
                                                <SelectItem value={VerticalType.K12}>K-12 School</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.verticalType && <p className="text-xs text-red-500">{errors.verticalType.message}</p>}
                            </div>

                            {/* Dynamic Fields - Grade Range for K12 */}
                            {selectedVertical === VerticalType.K12 && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <Label className="text-blue-900">
                                        Grade Range <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name="gradeRange"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="bg-white mt-2">
                                                    <SelectValue placeholder="Select Grade Range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={GradeLevel.PRIMARY}>Primary (Grades 1-5)</SelectItem>
                                                    <SelectItem value={GradeLevel.MIDDLE}>Middle (Grades 6-8)</SelectItem>
                                                    <SelectItem value={GradeLevel.HIGH}>High (Grades 9-12)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.gradeRange && <p className="text-xs text-red-500 mt-1">{errors.gradeRange.message}</p>}
                                    {/* <p className="text-xs text-blue-600 mt-2">Select the grade range your school serves.</p> */}
                                </div>
                            )}


                        </div>

                        {/* Form Actions */}
                        <div className="pt-4 flex justify-end gap-3 border-t">
                            <Button type="button" variant="outline" onClick={() => navigate("/schools")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || checkingEmis}>
                                {isSubmitting ? "Creating..." : "Create Institution"}
                            </Button>
                        </div>

                    </form>
                </Card>
            </div>
        </div>
    );
}
