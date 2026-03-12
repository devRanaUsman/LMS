import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, id, error, helperText, required, containerClassName, className, ...props }, ref) => {
        return (
            <div className={cn("space-y-2", containerClassName)}>
                <Label htmlFor={id}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                    id={id}
                    ref={ref}
                    className={cn(
                        error ? "border-red-500 focus:ring-red-500" : "",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
