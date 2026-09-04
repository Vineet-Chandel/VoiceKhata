"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getNames } from "country-list"

type Props = {
  value: string
  onChange: (country: string, currency: string) => void
}

const currencyMap: Record<string, string> = {
  India: "INR",
  "United States": "USD",
  Japan: "JPY",
  Germany: "EUR",
  France: "EUR",
  Canada: "CAD",
  Australia: "AUD",
  China: "CNY",
}

export default function Country({ value, onChange }: Props) {

  const countries = getNames()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>

      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value || "Select Country"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full max-w-[300px] p-2">

        <Input
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        <div className="max-h-60 overflow-y-auto overflow-x-hidden">

          {filtered.map((country) => {

            const currency = currencyMap[country] || ""

            return (
              <Button
                key={country}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onChange(country, currency)
                  setOpen(false) // closes dropdown instantly
                }}
              >
                {country}
              </Button>
            )
          })}

        </div>

      </DropdownMenuContent>

    </DropdownMenu>
  )
}