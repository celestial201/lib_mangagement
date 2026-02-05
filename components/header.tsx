'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CreditCard, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LibraryCard, type LibraryCardData } from '@/components/library-card'
import { MembershipForm, getStoredMember } from '@/components/membership-form'

export function Header() {
  const [showMembershipForm, setShowMembershipForm] = useState(false)
  const [showMyCard, setShowMyCard] = useState(false)
  const [member, setMember] = useState<LibraryCardData | null>(null)

  useEffect(() => {
    setMember(getStoredMember())
  }, [])

  const handleMembershipSuccess = () => {
    setMember(getStoredMember())
  }

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Library Assistant</h1>
              <p className="text-xs text-muted-foreground">Your personal book guide</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            {member ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowMyCard(true)}
              >
                <CreditCard className="w-4 h-4" />
                My Card
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowMembershipForm(true)}
              >
                <BadgeCheck className="w-4 h-4" />
                Get Library Card
              </Button>
            )}
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Help
            </a>
          </nav>
        </div>
      </header>

      <MembershipForm
        open={showMembershipForm}
        onOpenChange={setShowMembershipForm}
        onSuccess={handleMembershipSuccess}
      />

      <Dialog open={showMyCard} onOpenChange={setShowMyCard}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Your library card</DialogTitle>
          </DialogHeader>
          {member && (
            <div className="flex justify-center py-2">
              <LibraryCard member={member} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
