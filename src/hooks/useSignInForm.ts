import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signIn } from "../services/authService";

interface SignInFormState {
    phone: string;
    password: string;
    errors: {
        phone?: string;
        password?: string;
        form_root?: string;
    };
    isLoading: boolean;
}

const signInSchema = z.object({
    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(12, "Phone number is too long"),
    password: z.string().min(1, "Password is required"),
});

// NOTE:
// This hook calls src/services/authService.ts
// Today it's localStorage; later you will replace authService with real APIs.

export const useSignInForm = () => {
    const navigate = useNavigate();

    const [formState, setFormState] = useState<SignInFormState>({
        phone: "",
        password: "",
        errors: {},
        isLoading: false,
    });

    const validateField = useCallback(
        (name: keyof Pick<SignInFormState, "phone" | "password">, value: string) => {
            const schema = signInSchema.shape[name];
            const result = schema.safeParse(value);
            if (!result.success) return result.error.issues?.[0]?.message ?? "Invalid value";
            return "";
        },
        []
    );

    const setField = useCallback(
        (field: keyof Pick<SignInFormState, "phone" | "password">, value: string) => {
            setFormState((prev) => ({
                ...prev,
                [field]: value,
                errors: { ...prev.errors, [field]: "", form_root: "" },
            }));
        },
        []
    );

    const handleBlur = useCallback(
        (field: keyof Pick<SignInFormState, "phone" | "password">) => {
            const value = formState[field];
            const error = validateField(field, value);
            setFormState((prev) => ({
                ...prev,
                errors: { ...prev.errors, [field]: error },
            }));
        },
        [formState, validateField]
    );

    const validate = useCallback(() => {
        const result = signInSchema.safeParse({
            phone: formState.phone.replace(/-/g, ""),
            password: formState.password,
        });

        if (!result.success) {
            const fieldErrors: SignInFormState["errors"] = {};
            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof SignInFormState["errors"];
                fieldErrors[key] = issue.message;
            });
            setFormState((prev) => ({ ...prev, errors: fieldErrors }));
            return false;
        }

        setFormState((prev) => ({ ...prev, errors: {} }));
        return true;
    }, [formState]);

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;

        setFormState((prev) => ({ ...prev, isLoading: true, errors: { ...prev.errors, form_root: "" } }));

        try {
            await signIn({ phone: formState.phone, password: formState.password });
            navigate("/");
        } catch {
            setFormState((prev) => ({
                ...prev,
                errors: { ...prev.errors, form_root: "Invalid phone number or password" },
            }));
        } finally {
            setFormState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [formState, validate, navigate]);

    return { formState, setField, handleBlur, handleSubmit };
};
