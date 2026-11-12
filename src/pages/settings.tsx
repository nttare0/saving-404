import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Bell,
  Check,
  Download,
  Monitor,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel, SectionLabel } from "@/components/common/panel"
import { MemberAvatar } from "@/components/common/member-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useWorkspace } from "@/store/workspace"
import {
  loadNotificationPrefs,
  notificationOptions,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs"
import { cn } from "@/lib/utils"

const themeOptions = [
  {
    value: "light" as const,
    label: "Light",
    description: "Bright and airy",
    icon: Sun,
    preview: "bg-white border-zinc-200",
    bar: "bg-zinc-200",
    accent: "bg-violet-500",
    text: "text-zinc-900",
  },
  {
    value: "dark" as const,
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
    preview: "bg-zinc-950 border-zinc-800",
    bar: "bg-zinc-800",
    accent: "bg-violet-400",
    text: "text-zinc-100",
  },
  {
    value: "system" as const,
    label: "System",
    description: "Match this device",
    icon: Monitor,
    preview: "bg-[linear-gradient(115deg,#ffffff_0%,#ffffff_49%,#18181b_50%,#18181b_100%)] border-zinc-300 dark:border-zinc-700",
    bar: "bg-zinc-300 dark:bg-zinc-700",
    accent: "bg-violet-500",
    text: "text-zinc-800 dark:text-zinc-100",
  },
]

export function SettingsPage() {
  const { workspace, updateProfile, resetWorkspace } = useWorkspace()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [name, setName] = useState(workspace.profile.name)
  const [email, setEmail] = useState(workspace.profile.email)
  const [phone, setPhone] = useState(workspace.profile.phone)
  const [confirmReset, setConfirmReset] = useState(false)
  const [notifications, setNotifications] = useState<NotificationPrefs>(loadNotificationPrefs)

  useEffect(() => {
    setName(workspace.profile.name)
    setEmail(workspace.profile.email)
    setPhone(workspace.profile.phone)
  }, [workspace.profile])

  const dirty =
    name !== workspace.profile.name || email !== workspace.profile.email || phone !== workspace.profile.phone

  function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    toast.success("Profile updated", { description: "Your workspace details are saved." })
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "saving-404-workspace.json"
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success("Workspace exported", { description: "A JSON copy has been downloaded." })
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetWorkspace()
    setConfirmReset(false)
    toast.success("Demo data restored", { description: "Your workspace is back to its starting point." })
  }

  function toggleNotification(id: (typeof notificationOptions)[number]["id"], checked: boolean) {
    const next = { ...notifications, [id]: checked }
    setNotifications(next)
    saveNotificationPrefs(next)
    toast.success(checked ? "Reminder turned on" : "Reminder turned off")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune how Saving 404 looks, how it nudges you, and what happens to your data."
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <Panel
            title="Profile"
            description="How you appear across your savings workspace."
            action={
              <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Local only
              </span>
            }
          >
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/25 p-3">
                <MemberAvatar name={name || workspace.profile.name} tone="violet" size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{name || "Your name"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {workspace.profile.role} · {workspace.goals.length} savings goals
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                  Your name appears on your vault and budget summaries.
                </p>
                <Button type="submit" size="sm" className="h-8 rounded-lg" disabled={!dirty || name.trim().length < 2}>
                  Save profile
                </Button>
              </div>
            </form>
          </Panel>

          <Panel
            title="Appearance"
            description="Light, dark, or follow the device preference."
            action={<SectionLabel>{theme === "system" ? `System · ${resolvedTheme}` : theme}</SectionLabel>}
          >
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Theme">
              {themeOptions.map((option) => {
                const selected = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "group rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                      selected ? "border-primary/35 bg-primary/[0.04]" : "border-border/70 hover:border-border",
                    )}
                  >
                    <span className={cn("block h-[58px] overflow-hidden rounded-lg border p-2", option.preview)}>
                      <span className="flex items-center gap-1">
                        <span className={cn("h-1.5 w-8 rounded-full", option.bar)} />
                        <span className={cn("ml-auto h-1.5 w-1.5 rounded-full", option.accent)} />
                      </span>
                      <span className={cn("mt-2 block h-1.5 w-12 rounded-full", option.bar)} />
                      <span className={cn("mt-1.5 block h-3 w-full rounded", option.bar, "opacity-60")} />
                    </span>
                    <span className="mt-2 flex items-center gap-1.5 px-0.5">
                      <option.icon className="size-3.5 text-muted-foreground" />
                      <span className="text-[11.5px] font-medium">{option.label}</span>
                      {selected ? <Check className="ml-auto size-3.5 text-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block px-0.5 text-[10px] text-muted-foreground">{option.description}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
              System follows your device and updates automatically when it switches.
            </p>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Notifications"
            description="Gentle reminders, never a nag."
            action={<Bell className="size-4 text-muted-foreground" />}
          >
            <div className="divide-y divide-border/60">
              {notificationOptions.map((option) => (
                <div key={option.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Label htmlFor={`notify-${option.id}`} className="text-[12px] font-medium">
                      {option.label}
                    </Label>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch
                    id={`notify-${option.id}`}
                    checked={notifications[option.id]}
                    onCheckedChange={(checked) => toggleNotification(option.id, checked)}
                    aria-label={option.label}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Data & privacy"
            description="Everything lives in this browser. Nothing leaves your device."
            action={<UserRound className="size-4 text-muted-foreground" />}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5">
                <div>
                  <p className="text-[11.5px] font-medium">Saved records</p>
                  <p className="num mt-0.5 text-[10.5px] text-muted-foreground">
                    {workspace.goals.length} goals · {workspace.budget.categories.length} budget categories ·{" "}
                    {workspace.vaultLog.length} vault entries
                  </p>
                </div>
              </div>

              <Button variant="outline" className="h-9 w-full justify-start gap-2 rounded-lg" onClick={exportData}>
                <Download className="size-4" /> Export workspace as JSON
              </Button>

              <Button
                variant="ghost"
                onClick={handleReset}
                className={cn(
                  "h-9 w-full justify-start gap-2 rounded-lg",
                  confirmReset
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                    : "text-muted-foreground",
                )}
              >
                <RotateCcw className="size-4" />
                {confirmReset ? "Click again to reset all demo data" : "Reset demo data"}
              </Button>

              <p className="flex items-start gap-2 pt-1 text-[10.5px] leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                This is a front-end demo. Clearing your browser storage also clears the workspace.
              </p>
            </div>
          </Panel>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <p className="text-[11px] font-medium">About this workspace</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              Saving 404 brings personal savings goals and flexible budgets into one private workspace. Built with
              shadcn/ui and Bklit charts.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[10px] text-muted-foreground">
              <span>Version 0.2 · demo</span>
              <span>Kigali, Rwanda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
