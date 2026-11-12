import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CalendarDays, Plus, UsersRound } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { AvatarStack, MemberAvatar } from "@/components/common/member-avatar"
import { CircleMark } from "@/components/common/circle-mark"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { CircleDialog } from "@/components/dialogs/circle-dialog"
import { useWorkspace } from "@/store/workspace"
import { circleStats, workspaceTotals } from "@/lib/analytics"
import { formatDate, formatMoney } from "@/lib/format"

export function CirclesPage() {
  const { workspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const totals = useMemo(() => workspaceTotals(workspace), [workspace])
  const circles = workspace.circles.map((circle) => circleStats(workspace, circle))
  const upcoming = [...workspace.circles].sort(
    (a, b) => new Date(a.nextPayout.date).getTime() - new Date(b.nextPayout.date).getTime(),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Save together"
        title="Circles"
        description="Shared pots with clear contribution rules, member balances, loans and rotating payouts."
        actions={
          <Button className="h-9 gap-1.5 rounded-lg" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New circle
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Saved in circles</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(totals.circleTotal)}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Across {workspace.circles.length} active circles
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Members saving together</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">
            {new Set(workspace.circles.flatMap((circle) => circle.memberIds)).size}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Some people belong to more than one circle</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Arrears to recover</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(totals.arrears)}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {totals.membersLate} members need a reminder
          </p>
        </div>
      </div>

      <div aria-live="polite" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {circles.map(({ circle, totalContributed, progress, arrears, memberCount, nextPayout, paidMembers }) => {
          const member = workspace.members.find((item) => item.id === nextPayout.memberId)
          return (
            <Link
              key={circle.id}
              to={`/circles/${circle.id}`}
              className="group flex flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift sm:p-5"
            >
              <div className="flex items-start gap-3">
                <CircleMark color={circle.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[14.5px] font-semibold tracking-[-0.015em]">{circle.name}</h2>
                    <StatusBadge tone={circle.status === "active" ? "accent" : "neutral"}>
                      {circle.status === "active" ? "Active" : "Forming"}
                    </StatusBadge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                    {circle.purpose}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 bg-muted/25 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="num text-[17px] font-semibold tracking-[-0.02em]">{formatMoney(totalContributed)}</span>
                  <span className="num text-[10.5px] text-muted-foreground">{Math.round(progress)}% of target</span>
                </div>
                <ProgressBar
                  value={progress}
                  className="mt-2 h-1.5"
                  label={`${circle.name} contribution progress`}
                />
                <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted-foreground">
                  <span className="capitalize">{formatMoney(circle.contribution)} {circle.cadence}</span>
                  <span>{paidMembers}/{memberCount} fully paid</span>
                </div>
              </div>

              {arrears > 0 ? (
                <p className="mt-2.5 text-[10.5px] font-medium text-amber-700 dark:text-amber-300">
                  {formatMoney(arrears)} in arrears
                </p>
              ) : (
                <p className="mt-2.5 text-[10.5px] font-medium text-emerald-700 dark:text-emerald-300">
                  Everyone is up to date
                </p>
              )}

              <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3">
                <AvatarStack
                  limit={4}
                  size="xs"
                  people={circle.memberIds.map((id) => {
                    const item = workspace.members.find((candidate) => candidate.id === id)
                    return { name: item?.name ?? "Member", tone: item?.tone }
                  })}
                />
                <div className="text-right">
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">Next pot</p>
                  <p className="mt-0.5 text-[11px] font-medium">
                    {formatDate(nextPayout.date)} · {member?.name.split(" ")[0]}
                  </p>
                </div>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                Open circle <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="size-5" />
          </span>
          <span>
            <span className="block text-[13px] font-medium">Start another circle</span>
            <span className="mt-1 block max-w-[200px] text-[11px] leading-relaxed text-muted-foreground">
              Invite people you trust and set the contribution cadence.
            </span>
          </span>
        </button>
      </div>

      <Panel
        title="Upcoming payouts"
        description="Who receives the pot next, and when."
        action={<SectionLabel>Rotating schedule</SectionLabel>}
        bodyClassName="p-2 sm:p-2.5"
      >
        <div className="divide-y divide-border/60">
          {upcoming.map((circle) => {
            const member = workspace.members.find((item) => item.id === circle.nextPayout.memberId)
            return (
              <div key={circle.id} className="flex flex-wrap items-center gap-3 px-2.5 py-3">
                <MemberAvatar name={member?.name ?? "Member"} tone={member?.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium">
                    {member?.name ?? "Member"}{" "}
                    <span className="font-normal text-muted-foreground">receives the {circle.name} pot</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {formatDate(circle.nextPayout.date, "long")} · {circle.meeting}
                  </p>
                </div>
                <span className="num rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                  {formatMoney(circle.nextPayout.amount)}
                </span>
                <Link
                  to={`/circles/${circle.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  Details <ArrowRight className="size-3" />
                </Link>
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/60 px-3.5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        <UsersRound className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Contribution amounts, arrears and interest are all computed from the member ledger. Add a contribution or
          loan and every number updates instantly.
        </p>
      </div>

      <CircleDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
