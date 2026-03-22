'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface GcodeOutputProps {
  gcode: string
  filename: string
}

export function GcodeOutput({ gcode, filename }: GcodeOutputProps) {
  const [copied, setCopied] = useState(false)

  const lineCount = gcode ? gcode.split('\n').length : 0
  const charCount = gcode ? gcode.length : 0

  function handleCopy() {
    navigator.clipboard.writeText(gcode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([gcode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium">G-Code Output</CardTitle>
          {gcode && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">{lineCount} lines</Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleDownload}>
                Download
              </Button>
            </div>
          )}
        </div>
        {gcode && (
          <p className="text-xs text-muted-foreground font-mono">{filename}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0 pb-4 px-4">
        {gcode ? (
          <ScrollArea className="h-full rounded-md border bg-muted/30">
            <pre className="p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre">
              {gcode}
            </pre>
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
            Select a mode and click Generate
          </div>
        )}
      </CardContent>
    </Card>
  )
}
