import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function MoneyInput({
  value,
  onValueChange,
  id,
  placeholder,
  className,
  autoFocus,
  disabled,
  min = 0,
  step = 1000,
}: {
  value: number | ""
  onValueChange: (value: number | "") => void
  id?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
  disabled?: boolean
  min?: number
  step?: number
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground"
      >
        RWF
      </span>
      <Input
        id={id}
        inputMode="numeric"
        type="number"
        min={min}
        step={step}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          const raw = event.target.value
          onValueChange(raw === "" ? "" : Number(raw))
        }}
        className={cn("num h-10 border-input bg-background pl-12 text-[15px] font-medium", className)}
      />
    </div>
  )
}
