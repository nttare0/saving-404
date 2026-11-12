export const CURRENCY = "RWF"

const numberFormatter = new Intl.NumberFormat("en-RW", {
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat("en-RW", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatMoney(value: number, options?: { signed?: boolean; decimals?: boolean }) {
  const safe = Number.isFinite(value) ? value : 0
  const formatted = options?.decimals
    ? new Intl.NumberFormat("en-RW", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safe)
    : numberFormatter.format(Math.round(Math.abs(safe)))
  const sign = safe < 0 ? "−" : options?.signed && safe > 0 ? "+" : ""
  return `${sign}${CURRENCY} ${formatted}`
}

export function formatCompactMoney(value: number) {
  const safe = Number.isFinite(value) ? value : 0
  return `${CURRENCY} ${compactFormatter.format(safe)}`
}

export function formatNumber(value: number) {
  return numberFormatter.format(Math.round(Number.isFinite(value) ? value : 0))
}

export function formatPercent(value: number, digits = 0) {
  const safe = Number.isFinite(value) ? value : 0
  return `${safe.toFixed(digits)}%`
}

export function formatDate(input: string | Date, style: "long" | "short" | "month" = "short") {
  const date = typeof input === "string" ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return "—"
  if (style === "long") {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }
  if (style === "month") {
    return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(date)
  }
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date)
}

export function formatMonth(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input
  return new Intl.DateTimeFormat("en-GB", { month: "long" }).format(date)
}

export function daysBetween(from: string | Date, to: string | Date = new Date()) {
  const start = typeof from === "string" ? new Date(from) : from
  const end = typeof to === "string" ? new Date(to) : to
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
