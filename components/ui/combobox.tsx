"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string | number
  label: string
  searchableText?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | number
  onValueChange: (value: string | number | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  error?: boolean
  renderOption?: (option: ComboboxOption) => React.ReactNode
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  error = false,
  renderOption,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [isInitialMount, setIsInitialMount] = React.useState(true)

  React.useEffect(() => {
    // Prevent auto-opening on initial mount
    const timer = setTimeout(() => setIsInitialMount(false), 100)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (isInitialMount && open) {
      setOpen(false)
    }
  }, [isInitialMount, open])

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      if (!isInitialMount || !newOpen) {
        setOpen(newOpen)
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedOption && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
          disabled={disabled}
        >
          {selectedOption
            ? renderOption
              ? renderOption(selectedOption)
              : selectedOption.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-border"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
        }}
      >
        <Command 
          className="[&_[cmdk-input-wrapper]]:border-white/20 [&_[cmdk-input-wrapper]_svg]:text-white/70 [&_[cmdk-input]]:text-white [&_[cmdk-input]]:placeholder:text-white/70"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          }}
        >
          <CommandInput 
            placeholder={searchPlaceholder}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
            }}
          />
          <CommandList 
            className="max-h-[200px] overflow-y-auto"
            onWheel={(e) => {
              // Allow wheel events to propagate for scrolling
              e.stopPropagation()
            }}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
            }}
          >
            <CommandEmpty className="text-white/70 py-6">{emptyText}</CommandEmpty>
            <CommandGroup 
              className="[&_[cmdk-group-heading]]:text-white/70 gap-1 p-1"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
              }}
            >
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={
                    option.searchableText ||
                    option.label ||
                    String(option.value)
                  }
                  onSelect={() => {
                    onValueChange(
                      option.value === value ? undefined : option.value
                    )
                    setOpen(false)
                  }}
                  className="text-white data-[selected]:bg-white/20 data-[selected]:text-white hover:bg-white/10 rounded-sm"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    marginBottom: "2px",
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-white",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {renderOption ? renderOption(option) : option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
