"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
    value: Date | null
    onChange: (date: Date) => void
}

export default function DatePickerSimple({ value, onChange }: Props) {

    const [open, setOpen] = React.useState(false)

    return (
        <Field className="w-full">
            <FieldLabel htmlFor="date">Date of birth</FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>

                <PopoverTrigger asChild>

                    <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-start font-normal"
                    >
                        {value ? value.toLocaleDateString() : "Select date"}
                    </Button>

                </PopoverTrigger>

                <PopoverContent className="w-auto overflow-hidden p-0" align="start">

                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        defaultMonth={value || undefined}
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        onSelect={(date) => {
                            if (date) {
                                onChange(date)
                                setOpen(false)
                            }
                        }}
                    />

                </PopoverContent>

            </Popover>

        </Field>
    )
}