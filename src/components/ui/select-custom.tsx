import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Context for sharing state
interface SelectContextType {
    value?: string
    onValueChange?: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function Select({ value, onValueChange, children, open: controlledOpen, onOpenChange }: SelectProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const isControlled = controlledOpen !== undefined && onOpenChange !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = isControlled ? onOpenChange : setUncontrolledOpen

    return (
        <SelectContext.Provider value={{ value, onValueChange, open: !!open, setOpen: setOpen! }}>
            <div className="relative inline-block w-full">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

export function SelectTrigger({ className, children }: { className?: string, children: React.ReactNode }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    // Handle click outside
    const ref = React.useRef<HTMLButtonElement>(null)
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.select-content')) {
                context?.setOpen(false)
            }
        }
        if (context.open) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [context.open, context])

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-white",
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    // This assumes the children of SelectItem are the string labels. 
    // In a real radix implementation this is more complex, but for our simple use case:
    return (
        <span className="block truncate">
            {context.value || placeholder}
        </span>
    )
}

export function SelectContent({ className, children }: { className?: string, children: React.ReactNode }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    if (!context.open) return null

    return (
        <div className={cn(
            "select-content absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 top-[calc(100%+4px)] w-full w-auto min-w-full",
            className
        )}>
            <div className="p-1">
                {children}
            </div>
        </div>
    )
}

export function SelectItem({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                context.onValueChange?.(value);
                context.setOpen(false);
            }}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                isSelected && "bg-slate-100",
                className
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate text-slate-900">{children}</span>
        </div>
    )
}
