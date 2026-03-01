import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Documents() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Documents & Media</h1>
          <p className="mt-1 text-muted-foreground">Centralized media and document handling</p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Drag and drop files or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Passports, contracts, media. OCR status, secure share links.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
