import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarProps {
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    className?: string
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export function Calendar({ selected, onSelect, className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    // Generate calendar days
    const calendarDays: number[] = []

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push(-(daysInPrevMonth - i))
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i)
    }

    // Next month days to fill the grid
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push(-(i))
    }

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1))
    }

    const handleDateClick = (day: number) => {
        if (day > 0) {
            const newDate = new Date(year, month, day)
            onSelect?.(newDate)
        }
    }

    const isSelected = (day: number) => {
        if (!selected || day < 0) return false
        return (
            selected.getDate() === day &&
            selected.getMonth() === month &&
            selected.getFullYear() === year
        )
    }

    const isToday = (day: number) => {
        if (day < 0) return false
        const today = new Date()
        return (
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
        )
    }

    return (
        <div className={`p-3 bg-white rounded-lg border border-slate-200 ${className || ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="h-7 w-7"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-semibold text-slate-900">
                    {MONTHS[month]} {year}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-7 w-7"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-slate-500 h-8 flex items-center justify-center"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = day > 0
                    const actualDay = Math.abs(day)

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDateClick(day)}
                            disabled={!isCurrentMonth}
                            className={`
                                h-8 w-8 rounded-md text-sm flex items-center justify-center
                                transition-colors
                                ${!isCurrentMonth ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700'}
                                ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                ${isToday(day) && !isSelected(day) ? 'bg-slate-100 font-semibold' : ''}
                                ${isCurrentMonth && !isSelected(day) ? 'hover:bg-slate-100' : ''}
                            `}
                        >
                            {actualDay}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
