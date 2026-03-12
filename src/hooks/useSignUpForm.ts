import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { signUp } from "../services/authService";

interface SignUpFormState {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  errors: {
    name?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    form_root?: string;
  };
  isLoading: boolean;
}

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(12, "Phone number is too long"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const useSignUpForm = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<SignUpFormState>({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    errors: {},
    isLoading: false,
  });

  const setField = useCallback(
    (field: keyof Pick<SignUpFormState, "name" | "phone" | "password" | "confirmPassword">, value: string) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
        errors: { ...prev.errors, [field]: "", form_root: "" },
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof Pick<SignUpFormState, "name" | "phone" | "password" | "confirmPassword">) => {
      const result = signUpSchema.safeParse({
        name: formState.name,
        phone: formState.phone.replace(/-/g, ""),
        password: formState.password,
        confirmPassword: formState.confirmPassword,
      });

      if (result.success) {
        setFormState((p) => ({ ...p, errors: { ...p.errors, [field]: "" } }));
        return;
      }

      const issue = result.error.issues.find((i) => i.path?.[0] === field);
      setFormState((p) => ({
        ...p,
        errors: { ...p.errors, [field]: issue?.message ?? "" },
      }));
    },
    [formState]
  );

  const validate = useCallback(() => {
    const result = signUpSchema.safeParse({
      name: formState.name,
      phone: formState.phone.replace(/-/g, ""),
      password: formState.password,
      confirmPassword: formState.confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: SignUpFormState["errors"] = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof SignUpFormState["errors"];
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
      await signUp({ name: formState.name, phone: formState.phone, password: formState.password });
      navigate("/");
    } catch (e: any) {
      const code = e?.code;
      const msg = code === "user-exists" ? "Account already exists. Please sign in." : "Signup failed. Try again.";
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, form_root: msg },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [formState, validate, navigate]);

  return { formState, setField, handleBlur, handleSubmit };
};
