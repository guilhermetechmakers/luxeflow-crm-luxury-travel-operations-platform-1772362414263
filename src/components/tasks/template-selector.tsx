/**
 * TemplateSelector - Dropdown/modal to pick a task template
 * Templates include context mapping (booking fields, client fields)
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { TaskTemplate } from '@/types/task'

export interface TemplateSelectorProps {
  templates: TaskTemplate[]
  value?: string
  onSelect: (template: TaskTemplate | null) => void
  placeholder?: string
  disabled?: boolean
}

export function TemplateSelector({
  templates,
  value,
  onSelect,
  placeholder = 'Choose template',
  disabled,
}: TemplateSelectorProps) {
  const list = templates ?? []

  return (
    <div className="space-y-2">
      <Label>Template</Label>
      <Select
        value={value ?? 'none'}
        onValueChange={(v) => {
          if (v === 'none') {
            onSelect(null)
          } else {
            const t = list.find((tpl) => tpl.id === v)
            onSelect(t ?? null)
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Select task template">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No template</SelectItem>
          {list.map((tpl) => (
            <SelectItem key={tpl.id} value={tpl.id}>
              {tpl.name}
              {tpl.bookingContextId && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (booking)
                </span>
              )}
              {tpl.clientContextId && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (client)
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
