import { Toaster } from "sonner"
import { useTheme } from "@/components/theme-provider"

export function AppToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme}
      position="bottom-right"
      closeButton
      offset={20}
      mobileOffset={{ bottom: 100, left: 16, right: 16 }}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-popover text-popover-foreground shadow-lift text-[13px]",
          description: "text-muted-foreground text-[12px]",
          actionButton: "bg-primary text-primary-foreground",
          closeButton: "border-border bg-popover text-muted-foreground hover:text-foreground",
        },
      }}
    />
  )
}
