import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import { formatCompactMoney, formatMoney } from "@/lib/format"

type ContributionPoint = { month: string; contributed: number; date: Date }

export function ContributionsBarChart({ data }: { data: ContributionPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.contributed, 0)

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Contributions over the last six months total {formatMoney(total)}.
      </figcaption>
    <BarChart
      data={data}
      xDataKey="month"
      aspectRatio="2.1 / 1"
      margin={{ top: 18, right: 8, bottom: 24, left: 8 }}
    >
      <Grid horizontal numTicksRows={3} stroke="var(--chart-grid)" strokeDasharray="3,6" />
      <Bar
        dataKey="contributed"
        fill="var(--chart-1)"
        lineCap="round"
        showValue
        valueLabelFormatter={(value) => formatCompactMoney(value).replace("RWF ", "")}
        valueLabelColor="var(--primary-foreground)"
      />
      <BarXAxis showAllLabels />
      <ChartTooltip
        showCrosshair={false}
        rows={(point) => [
          {
            color: "var(--chart-1)",
            label: "Contributed",
            value: formatMoney(Number(point.contributed ?? 0)),
          },
        ]}
      />
    </BarChart>
    </figure>
  )
}
