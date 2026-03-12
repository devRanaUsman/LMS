import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

import { Slot } from "@radix-ui/react-slot"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps & { tooltip?: string }>(
    ({ className, variant, size, asChild = false, isLoading, leftIcon, rightIcon, children, disabled, tooltip, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        let buttonContent = children;
        if (!asChild) {
            buttonContent = (
                <>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center justify-center">{leftIcon}</span>}
                    {children}
                    {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center justify-center">{rightIcon}</span>}
                </>
            );
        }

        const button = (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || disabled}
                {...props}
            >
                {buttonContent}
            </Comp>
        )

        if (!tooltip) {
            return button
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {isLoading || disabled ? (
                            <span tabIndex={0} style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                                {button}
                            </span>
                        ) : (
                            button
                        )}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
