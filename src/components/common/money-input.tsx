import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

function digitsOf(value: string) {
  return value.replace(/\D/g, "").slice(0, 12)
}

export function MoneyInput({
  value,
  onValueChange,
  id,
  placeholder,
  className,
  autoFocus,
  disabled,
  size = "default",
}: {
  value: number | ""
  onValueChange: (value: number | "") => void
  id?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
  disabled?: boolean
  size?: "default" | "large"
}) {
  const [text, setText] = useState(() => (value === "" ? "" : formatNumber(value)))
  const large = size === "large"

  useEffect(() => {
    if (value === "") {
      setText((current) => (current === "" ? current : ""))
      return
    }
    const parsed = Number(digitsOf(text))
    if (parsed !== value) setText(formatNumber(value))
    // Keep the field in sync when the amount is changed from outside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 font-medium text-muted-foreground",
          large ? "left-4 text-[13px]" : "left-3.5 text-[11px]",
        )}
      >
        RWF
      </span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9,]*"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder ?? "0"}
        value={text}
        onChange={(event) => {
          const digits = digitsOf(event.target.value)
          if (!digits || Number(digits) === 0) {
            setText("")
            onValueChange("")
            return
          }
          const next = Number(digits)
          setText(formatNumber(next))
          onValueChange(next)
        }}
        onFocus={(event) => {
          if (large) event.currentTarget.select()
        }}
        className={cn(
          "num border-input bg-background font-semibold tracking-[-0.01em] placeholder:font-medium placeholder:text-muted-foreground/60",
          large
            ? "h-16 rounded-xl pl-16 pr-4 text-[26px]"
            : "h-11 rounded-lg pl-12 pr-3 text-[15px]",
          className,
        )}
      />
    </div>
  )
}
