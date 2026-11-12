import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip"
import { formatCompactMoney, formatMoney } from "@/lib/format"

export type MemberPoint = { name: string; paid: number; target: number }

export function MemberContributionsBar({ data }: { data: MemberPoint[] }) {
  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Contributions paid by each member, compared with the expected total.
      </figcaption>
    <BarChart
      data={data}
      xDataKey="name"
      aspectRatio="2.6 / 1"
      barGap={0.34}
      margin={{ top: 16, right: 8, bottom: 22, left: 8 }}
    >
      <Grid horizontal numTicksRows={3} stroke="var(--chart-grid)" strokeDasharray="3,6" />
      <Bar dataKey="target" fill="var(--border)" lineCap="round" />
      <Bar
        dataKey="paid"
        fill="var(--chart-1)"
        lineCap="round"
        showValue
        valueLabelFormatter={(value) => formatCompactMoney(value).replace("RWF ", "")}
        valueLabelColor="var(--primary-foreground)"
      />
      <BarXAxis maxLabels={{ base: 4, sm: 5, md: 6, lg: 8 }} />
      <ChartTooltip
        showCrosshair={false}
        rows={(point) => [
          {
            color: "var(--chart-1)",
            label: "Paid",
            value: formatMoney(Number(point.paid ?? 0)),
          },
          {
            color: "var(--muted-foreground)",
            label: "Expected",
            value: formatMoney(Number(point.target ?? 0)),
          },
        ]}
      />
    </BarChart>
    </figure>
  )
}
