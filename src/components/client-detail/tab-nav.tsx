/**
 * TabNav - Tab navigation for Client Detail sections
 * Renders Tabs.List only - must be used inside Tabs.Root
 */
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
}

export interface TabNavProps {
  tabs: TabItem[]
  value: string
  onValueChange?: (value: string) => void
  className?: string
}

export function TabNav({ tabs, className }: TabNavProps) {
  // value and onValueChange are passed for API compatibility; Radix Tabs.Root controls state
  return (
    <Tabs.List
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-thin',
        className
      )}
      aria-label="Client detail sections"
    >
      {(tabs ?? []).map((tab) => (
        <Tabs.Trigger
          key={tab.value}
          value={tab.value}
          className={cn(
            'whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors',
            'hover:text-foreground data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          {tab.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  )
}
