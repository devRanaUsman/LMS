import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
    date?: Date
    setDate: (date: Date | undefined) => void
    className?: string
    placeholder?: string
}

export function DatePicker({ date, setDate, className, placeholder = "Pick a date" }: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    React.useEffect(() => {
        if (date) {
            setInputValue(format(date, "PPP"))
        } else {
            setInputValue("")
        }
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
        const parsedDate = new Date(e.target.value)
        if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate)
        } else if (e.target.value === "") {
            setDate(undefined)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn("relative w-[280px]", className)}>
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="pr-10"
                    onClick={() => setOpen(true)}
                />
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    selected={date}
                    onSelect={(d) => {
                        setDate(d)
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}
