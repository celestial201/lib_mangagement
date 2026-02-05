'use client'

import { BookOpen, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface LibraryCardData {
  name: string
  email: string
  cardNumber: string
  tier: string
  joinedAt: string
}

const benefits = [
  'Unlimited AI book recommendations',
  'Personal reading suggestions',
  'Author & literary information',
  'Book club resources',
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function LibraryCard({
  member,
  className,
  compact = false,
}: {
  member: LibraryCardData
  className?: string
  compact?: boolean
}) {
  const handleDownload = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Library Card - ${member.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; padding: 24px; background: #f5f5f5; }
            .card {
              max-width: 400px; margin: 0 auto;
              background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
              color: white; border-radius: 16px; padding: 24px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
            .logo { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 10px; }
            h1 { font-size: 1.25rem; }
            .card-number { font-family: monospace; font-size: 1.1rem; letter-spacing: 2px; margin: 16px 0; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; }
            .member-name { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
            .member-date { font-size: 0.85rem; opacity: 0.8; }
            .barcode { height: 40px; margin-top: 16px; border-radius: 4px; background: repeating-linear-gradient(90deg, white 0, white 2px, transparent 2px, transparent 4px); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="card-header">
              <div class="logo"></div>
              <div>
                <h1>Library Card</h1>
                <p style="font-size: 0.875rem; opacity: 0.7;">Member • ${member.tier}</p>
              </div>
            </div>
            <div class="card-number">${member.cardNumber}</div>
            <div style="margin-bottom: 16px;">
              <p class="member-name">${member.name}</p>
              <p style="font-size: 0.875rem; opacity: 0.7;">${member.email}</p>
              <p class="member-date">Member since ${formatDate(member.joinedAt)}</p>
            </div>
            <div class="barcode"></div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white shadow-xl',
        'border border-white/10',
        compact ? 'p-4 max-w-sm' : 'p-6 max-w-md',
        className
      )}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Library Card</h2>
            <p className="text-sm text-white/70">Member • {member.tier}</p>
          </div>
        </div>

        <div className="font-mono text-lg tracking-widest mb-4 px-4 py-3 bg-black/20 rounded-lg">
          {member.cardNumber}
        </div>

        <div className="space-y-1 mb-4">
          <p className="font-semibold text-xl">{member.name}</p>
          <p className="text-sm text-white/70">{member.email}</p>
          <p className="text-xs text-white/60">Member since {formatDate(member.joinedAt)}</p>
        </div>

        {/* Barcode-style visual */}
        <div
          className="h-10 rounded bg-white/10"
          style={{
            background: `repeating-linear-gradient(90deg, white 0, white 2px, transparent 2px, transparent 4px)`,
          }}
        />

        {!compact && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/70 mb-2">Member benefits:</p>
            <ul className="text-xs text-white/60 space-y-1">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!compact && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 w-full gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Download / Print Card
        </Button>
      )}
    </div>
  )
}
