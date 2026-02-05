'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { LibraryCard, type LibraryCardData } from '@/components/library-card'

const MEMBER_STORAGE_KEY = 'library-member'

export function getStoredMember(): LibraryCardData | null {
  if (typeof window === 'undefined') return null
  try {
    const s = localStorage.getItem(MEMBER_STORAGE_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export function setStoredMember(member: LibraryCardData | null) {
  if (typeof window === 'undefined') return
  if (member) {
    localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(member))
  } else {
    localStorage.removeItem(MEMBER_STORAGE_KEY)
  }
}

export function MembershipForm({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (member: LibraryCardData) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newMember, setNewMember] = useState<LibraryCardData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create membership')
      }

      const member: LibraryCardData = {
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        tier: data.tier,
        joinedAt: data.joinedAt,
      }

      setNewMember(member)
      setStoredMember(member)
      onSuccess?.(member)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNewMember(null)
    setName('')
    setEmail('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !newMember && onOpenChange(o)}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={!newMember}
        onPointerDownOutside={(e) => newMember && e.preventDefault()}
        onEscapeKeyDown={(e) => newMember && e.preventDefault()}
      >
        {newMember ? (
          <>
            <DialogHeader>
              <DialogTitle>Welcome to the library!</DialogTitle>
              <DialogDescription>
                Your digital library card is ready. Use it to access all member benefits.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <LibraryCard member={newMember} />
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get your library card</DialogTitle>
              <DialogDescription>
                Create a free membership to access AI book recommendations, personalized
                suggestions, and more.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create membership'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
