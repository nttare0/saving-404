import { AreaChart } from "@/components/charts/area-chart"
import { Area } from "@/components/charts/area"
import { Grid } from "@/components/charts/grid"
import { XAxis } from "@/components/charts/x-axis"
import { YAxis } from "@/components/charts/y-axis"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import { formatCompactMoney, formatDate, formatMoney } from "@/lib/format"

type SavingsPoint = { date: Date; saved: number }

export function SavingsAreaChart({
  data,
  seriesLabel = "Total saved",
}: {
  data: SavingsPoint[]
  seriesLabel?: string
}) {
  const latest = data[data.length - 1]
  const first = data[0]

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Savings growth from {first ? formatDate(first.date, "long") : "the start of the period"} to{" "}
        {latest ? formatDate(latest.date, "long") : "today"}, ending at {latest ? formatMoney(latest.saved) : "zero"}.
      </figcaption>
    <AreaChart
      data={data}
      aspectRatio="2.2 / 1"
      margin={{ top: 18, right: 14, bottom: 26, left: 42 }}
      className="w-full"
    >
      <Grid horizontal numTicksRows={4} stroke="var(--chart-grid)" strokeDasharray="3,6" />
      <Area
        dataKey="saved"
        fill="var(--chart-1)"
        fillOpacity={0.28}
        strokeWidth={2}
        gradientToOpacity={0}
        showHighlight
      />
      <XAxis numTicks={6} />
      <YAxis
        numTicks={4}
        formatValue={(value) => formatCompactMoney(value).replace("RWF ", "")}
      />
      <ChartTooltip
        showDatePill
        indicatorColor="var(--chart-1)"
        rows={(point) => [
          {
            color: "var(--chart-1)",
            label: seriesLabel,
            value: formatMoney(Number(point.saved ?? 0)),
          },
        ]}
        content={({ point }) => (
          <div className="space-y-2 px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-chart-tooltip-muted">
              {formatDate(point.date as Date, "long")}
            </p>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-chart-1" />
              <span className="text-sm text-chart-tooltip-muted">{seriesLabel}</span>
              <span className="num ml-auto text-sm font-semibold text-chart-tooltip-foreground">
                {formatMoney(Number(point.saved ?? 0))}
              </span>
            </div>
          </div>
        )}
      />
    </AreaChart>
    </figure>
  )
}
