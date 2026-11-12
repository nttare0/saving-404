import { RingChart } from "@/components/charts/ring-chart"
import { Ring } from "@/components/charts/ring"
import { RingCenter } from "@/components/charts/ring-center"
import type { Bucket } from "@/lib/data"
import { formatCompactMoney } from "@/lib/format"

const labels: Record<Bucket, string> = { needs: "Needs", wants: "Wants", savings: "Savings" }
const colors: Record<Bucket, string> = {
  needs: "var(--chart-1)",
  wants: "var(--chart-2)",
  savings: "var(--chart-3)",
}

export function BudgetRings({
  buckets,
}: {
  buckets: Record<Bucket, { cap: number; spent: number }>
}) {
  const data = (["needs", "wants", "savings"] as Bucket[]).map((bucket) => ({
    label: labels[bucket],
    value: buckets[bucket].spent,
    maxValue: Math.max(1, buckets[bucket].cap),
    color: colors[bucket],
  }))

  const totalSpent = data.reduce((total, item) => total + item.value, 0)

  return (
    <figure className="m-0">
      <figcaption className="sr-only">
        Spending by budget bucket: needs {formatCompactMoney(buckets.needs.spent)}, wants{" "}
        {formatCompactMoney(buckets.wants.spent)}, savings {formatCompactMoney(buckets.savings.spent)}.
      </figcaption>
    <RingChart data={data} size={248} strokeWidth={13} ringGap={7} baseInnerRadius={52}>
      {data.map((item, index) => (
        <Ring key={item.label} index={index} color={item.color} showGlow={false} />
      ))}
      <RingCenter
        defaultLabel="Spent this month"
        prefix="RWF "
        formatOptions={{ notation: "compact", maximumFractionDigits: 1 }}
        valueClassName="num text-[17px] font-semibold tracking-[-0.03em] text-foreground"
        labelClassName="mt-1 text-[9.5px] leading-tight text-muted-foreground"
      />
      <span className="sr-only">
        {`Spent ${formatPlain(totalSpent)} this month across needs, wants and savings.`}
      </span>
    </RingChart>
    </figure>
  )
}

function formatPlain(value: number) {
  return new Intl.NumberFormat("en-RW").format(Math.round(value))
}
