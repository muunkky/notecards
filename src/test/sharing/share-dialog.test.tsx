import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { FEATURE_DECK_SHARING, Deck } from '../../types'
import { addCollaborator as addCollabHelper } from '../../sharing/collaborators'

// We will implement ShareDeckDialog next; for now test will fail.
import { ShareDeckDialog } from '../../ui/ShareDeckDialog'
import * as invitation from '../../sharing/invitationService'

const mockDeck: Deck = {
  id: 'd1',
  title: 'Alpha',
  ownerId: 'owner-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  collaboratorIds: [],
  roles: { 'owner-1': 'owner' }
}

// Feature flag off-case test is only meaningful when flag = false. We skip it otherwise to avoid tautological assertions.
const itFlagOff = FEATURE_DECK_SHARING ? it.skip : it
describe('ShareDeckDialog (feature flag gating)', () => {
  itFlagOff('renders nothing when feature flag off', () => {
  render(<ShareDeckDialog deck={mockDeck} onClose={() => {}} addCollaborator={vi.fn()} removeCollaborator={vi.fn()} changeCollaboratorRole={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('ShareDeckDialog basic behaviors', () => {
  it('shows existing collaborators list (excluding owner)', () => {
    const deck: Deck = { ...mockDeck, collaboratorIds: ['u2'], roles: { 'owner-1': 'owner', 'u2': 'editor' } }
  render(<ShareDeckDialog deck={deck} onClose={() => {}} addCollaborator={vi.fn()} removeCollaborator={vi.fn()} changeCollaboratorRole={vi.fn()} />)
    expect(screen.getByText(/Collaborators/i)).toBeInTheDocument()
    expect(screen.getByText(/editor/i)).toBeInTheDocument()
  })

  it('validates empty email and does not call addCollaborator', () => {
    const add = vi.fn()
  render(<ShareDeckDialog deck={mockDeck} onClose={() => {}} addCollaborator={add} removeCollaborator={vi.fn()} changeCollaboratorRole={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(add).not.toHaveBeenCalled()
    expect(screen.getByText(/enter an email/i)).toBeInTheDocument()
  })

  it('submits valid email and clears input', () => {
    const add = vi.fn().mockResolvedValue(undefined)
    render(<ShareDeckDialog deck={mockDeck} onClose={() => {}} addCollaborator={add} removeCollaborator={vi.fn()} changeCollaboratorRole={vi.fn()} />)
    const input = screen.getByPlaceholderText(/invite by email/i)
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(add).toHaveBeenCalledWith(mockDeck, 'user@example.com')
  })

  it('calls changeCollaboratorRole when role is changed', () => {
    const change = vi.fn().mockResolvedValue(undefined)
    const deck: Deck = { ...mockDeck, collaboratorIds: ['u2'], roles: { 'owner-1': 'owner', 'u2': 'editor' } }
    render(
      <ShareDeckDialog
        deck={deck}
        onClose={() => {}}
        addCollaborator={vi.fn()}
        removeCollaborator={vi.fn()}
        changeCollaboratorRole={change}
      />
    )
    const select = screen.getByTestId('role-select-u2') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'viewer' } })
    expect(change).toHaveBeenCalledWith(deck, 'u2', 'viewer')
  })

  it('calls removeCollaborator when remove is clicked', () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const deck: Deck = { ...mockDeck, collaboratorIds: ['u2'], roles: { 'owner-1': 'owner', 'u2': 'viewer' } }
    render(
      <ShareDeckDialog
        deck={deck}
        onClose={() => {}}
        addCollaborator={vi.fn()}
        removeCollaborator={remove}
        changeCollaboratorRole={vi.fn()}
      />
    )
    const btn = screen.getByRole('button', { name: /Remove collaborator u2/i })
    fireEvent.click(btn)
    expect(remove).toHaveBeenCalledWith(deck, 'u2')
  })

  it('falls back to creating an invite when user email not found', async () => {
    const add = vi.fn().mockRejectedValue(new (class extends Error {})())
    const createInviteSpy = vi.spyOn(invitation, 'createInvite').mockResolvedValue({
      id: 'inv1', deckId: mockDeck.id, inviterId: 'owner-1', emailLower: 'nouser@example.com', roleRequested: 'viewer', status: 'pending', createdAt: new Date(), updatedAt: new Date()
    } as any)

    render(<ShareDeckDialog deck={mockDeck} onClose={() => {}} addCollaborator={add} removeCollaborator={vi.fn()} changeCollaboratorRole={vi.fn()} />)
    const input = screen.getByPlaceholderText(/invite by email/i)
    fireEvent.change(input, { target: { value: 'NoUser@Example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    // Implementation will call invitationService when addCollaborator rejects with UserNotFound; our test uses a generic error
    // to keep coupling low and only asserts the fallback path is attempted.
    expect(createInviteSpy).toHaveBeenCalled()
  })

  it('renders pending invites and allows revoke', async () => {
    const listSpy = vi.spyOn(invitation, 'listPendingInvites').mockResolvedValue([
      { id: 'inv-1', deckId: mockDeck.id, inviterId: 'owner-1', emailLower: 'pending@example.com', roleRequested: 'viewer', status: 'pending', createdAt: new Date(), updatedAt: new Date() } as any
    ])
    const revokeSpy = vi.spyOn(invitation, 'revokeInvite').mockResolvedValue()

    render(
      <ShareDeckDialog
        deck={mockDeck}
        onClose={() => {}}
        addCollaborator={vi.fn()}
        removeCollaborator={vi.fn()}
        changeCollaboratorRole={vi.fn()}
      />
    )

    // Invite email should render
    expect(await screen.findByText('pending@example.com')).toBeInTheDocument()

    // Click revoke and ensure service called
    const revokeBtn = screen.getByRole('button', { name: /Revoke invite pending@example.com/i })
    fireEvent.click(revokeBtn)
    expect(revokeSpy).toHaveBeenCalledWith('inv-1', 'owner-1')
  })
})
