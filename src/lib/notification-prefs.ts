export const NOTIFICATIONS_KEY = "saving-404:notifications:v2"
export const NOTIFICATIONS_EVENT = "saving-404:notifications"

export const notificationOptions = [
  {
    id: "savings",
    label: "Savings reminders",
    description: "Two days before your monthly auto-save.",
    default: true,
  },
  {
    id: "milestones",
    label: "Goal milestones",
    description: "When a goal passes 50%, 75% or 100%.",
    default: true,
  },
  {
    id: "budget",
    label: "Budget check-ins",
    description: "When a category gets close to its cap.",
    default: true,
  },
  {
    id: "digest",
    label: "Monthly money digest",
    description: "A short summary of savings and spending.",
    default: false,
  },
] as const

export type NotificationPrefs = Record<(typeof notificationOptions)[number]["id"], boolean>

export function defaultNotificationPrefs(): NotificationPrefs {
  return Object.fromEntries(notificationOptions.map((option) => [option.id, option.default])) as NotificationPrefs
}

export function loadNotificationPrefs(): NotificationPrefs {
  const defaults = defaultNotificationPrefs()
  try {
    const stored = window.localStorage.getItem(NOTIFICATIONS_KEY)
    if (!stored) return defaults
    return { ...defaults, ...(JSON.parse(stored) as Partial<NotificationPrefs>) }
  } catch {
    return defaults
  }
}

export function saveNotificationPrefs(next: NotificationPrefs) {
  try {
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
  } catch {
    // Preferences stay in memory when storage is unavailable.
  }
  window.dispatchEvent(new Event(NOTIFICATIONS_EVENT))
}
