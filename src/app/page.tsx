import Link from 'next/link'
import { GROUPS, MODES } from '@/lib/modes'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div className="max-w-xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Choose a mode</h2>
        <p className="text-muted-foreground">
          Each mode generates a specific G-code test pattern. Select one to configure and download.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODES.map((mode) => {
          const group = GROUPS[mode.group]
          return (
            <Link
              key={mode.value}
              href={`/${mode.value}`}
              className="rounded-lg border bg-card p-4 space-y-2 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm leading-snug">{mode.label}</span>
                <span
                  className={cn(
                    'text-xs font-medium shrink-0 mt-0.5 px-1.5 py-0.5 rounded-full border',
                    group.text,
                    group.accent,
                  )}
                >
                  {mode.group}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{mode.description}</p>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
