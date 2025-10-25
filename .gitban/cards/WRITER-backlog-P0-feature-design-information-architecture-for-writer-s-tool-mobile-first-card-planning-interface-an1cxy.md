# Information Architecture for Writer's Tool

## User Mental Model

Writers using index cards for story planning (David Lynch 70-card method, Blake Snyder beat sheets) have a specific mental model:

1. **Cards are the atomic unit** - Each card = one scene/beat/moment
2. **Spatial arrangement = story structure** - Order matters, grouping matters
3. **Quick capture + later refinement** - Jot down idea, expand later
4. **Visual scanning** - See many cards at once to feel the rhythm
5. **Tactile manipulation** - Move cards around to find the right flow

## Core Screens (Mobile-Only)

### 1. Deck List (Home)
**Purpose**: Choose which story/project to work on

**Layout**:
```
┌────────────────────────────────┐
│ NOTECARDS              [+]     │ ← Header (black text, white bg)
├────────────────────────────────┤
│                                │
│ ┌────────────────────────────┐ │
│ │ My Screenplay              │ │
│ │ 47 cards · Updated 2h ago  │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ Novel Draft                │ │
│ │ 32 cards · Updated 5d ago  │ │
│ └────────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Interaction**:
- Tap deck → Opens card list for that deck
- Tap [+] → Create new deck (bottom sheet)
- Long-press deck → Delete/rename options (overlay menu)

---

### 2. Card List (Main Working View)
**Purpose**: See all cards, arrange them, work on them

**Layout** (Collapsed State):
```
┌────────────────────────────────┐
│ ← My Screenplay        [···]   │ ← Sticky header
├────────────────────────────────┤
│                                │
│ ┌─┬──────────────────────────┐ │
│ │█│ INT. COFFEE SHOP - DAY   │ │ ← Red decorator (conflict)
│ └─┴──────────────────────────┘ │
│                                │ ← 8px gap
│ ┌─┬──────────────────────────┐ │
│ │█│ Sarah meets Tom          │ │ ← Blue decorator (character)
│ └─┴──────────────────────────┘ │
│                                │
│ ┌─┬──────────────────────────┐ │
│ │█│ Flashback to college     │ │ ← Purple decorator (theme)
│ └─┴──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Layout** (Expanded State):
```
┌────────────────────────────────┐
│ ← My Screenplay        [···]   │
├────────────────────────────────┤
│                                │
│ ┌─┬──────────────────────────┐ │
│ │█│ INT. COFFEE SHOP - DAY   │ │ ← Tappable header
│ ├─┼──────────────────────────┤ │
│ │ │ Sarah enters, nervous.   │ │
│ │ │ Tom is already there,    │ │
│ │ │ reading the letter she   │ │
│ │ │ sent. Their eyes meet.   │ │ ← Content visible
│ │ │                          │ │
│ │ │ CONFLICT: She lied about │ │
│ │ │ where she was that night.│ │
│ └─┴──────────────────────────┘ │
│                                │
│ ┌─┬──────────────────────────┐ │
│ │█│ Sarah meets Tom          │ │ ← Other cards collapsed
│ └─┴──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Interactions**:
- Tap card → Expand/collapse
- Tap [···] in header → Deck options (overlay menu)
  - Add card
  - Reorder mode
  - Filter by category
  - Export deck
- Long-press card → Card options (overlay menu)
  - Edit
  - Delete
  - Change category
  - Duplicate
- Swipe left on card → Quick delete (with undo toast)

---

### 3. Card Editor (Full Screen)
**Purpose**: Write/edit card content

**Layout**:
```
┌────────────────────────────────┐
│ [Cancel]          [Save]       │ ← Header actions
├────────────────────────────────┤
│                                │
│ ┌────────────────────────────┐ │
│ │ Title                      │ │
│ │ INT. COFFEE SHOP - DAY     │ │ ← Input (black border)
│ └────────────────────────────┘ │
│                                │
│ Category: [Conflict ▼]         │ ← Category picker
│                                │
│ ┌────────────────────────────┐ │
│ │ Content                    │ │
│ │                            │ │
│ │ Sarah enters, nervous...   │ │
│ │                            │ │
│ │                            │ │ ← Textarea (auto-expand)
│ │                            │ │
│ │                            │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Interactions**:
- Tap Cancel → Confirm discard (if changes)
- Tap Save → Save and return to card list
- Category dropdown → Bottom sheet with color-coded options

---

### 4. Reorder Mode
**Purpose**: Rearrange cards to find story flow

**Layout**:
```
┌────────────────────────────────┐
│ Reorder Cards          [Done]  │
├────────────────────────────────┤
│                                │
│ ┌─┬────────────────────────┬─┐ │
│ │█│ INT. COFFEE SHOP - DAY │≡│ │ ← Drag handle
│ └─┴────────────────────────┴─┘ │
│                                │
│ ┌─┬────────────────────────┬─┐ │
│ │█│ Sarah meets Tom        │≡│ │
│ └─┴────────────────────────┴─┘ │
│                                │
│ ┌─┬────────────────────────┬─┐ │
│ │█│ Flashback to college   │≡│ │
│ └─┴────────────────────────┴─┘ │
│                                │
└────────────────────────────────┘
```

**Interactions**:
- Long-press then drag card → Reorder
- Tap [Done] → Exit reorder mode

---

## Navigation Flow

```
Deck List
    ↓ (tap deck)
Card List ←→ Card Editor (tap card to expand, tap edit)
    ↓ (long-press + reorder)
Reorder Mode
    ↓ (tap done)
Card List
```

## Category System

Writers organize cards by dramatic function:

1. **Conflict** (Red #e11d48) - Tension, obstacles, drama
2. **Character** (Blue #3b82f6) - Development, relationships, arcs
3. **Location** (Amber #f59e0b) - Setting, atmosphere, world
4. **Theme** (Purple #8b5cf6) - Motifs, symbols, meaning
5. **Action** (Orange #f97316) - Plot beats, events
6. **Dialogue** (Pink #ec4899) - Key conversations

Each category gets a 4px left decorator strip.

---

## Component Hierarchy

```
App
├─ DeckListScreen
│  └─ DeckCard (repeats)
├─ CardListScreen
│  ├─ CardListHeader (sticky)
│  ├─ CardItem (repeats, collapsible)
│  └─ AddCardButton (floating action)
├─ CardEditorScreen
│  ├─ EditorHeader
│  ├─ TitleInput
│  ├─ CategoryPicker
│  └─ ContentTextarea
└─ ReorderScreen
   └─ DraggableCardItem (repeats)
```

---

## Key Design Decisions

1. **No skeuomorphism** - Don't replicate physical cards, translate the feeling
2. **Collapsed by default** - Visual scanning of many cards (titles only)
3. **Expand in place** - One card open at a time, context preserved
4. **4px decorator strips** - Category color without overwhelming
5. **Monospace titles** - Terminal aesthetic, fixed-width rhythm
6. **Black borders** - Strong boundaries, not subtle
7. **White backgrounds** - High contrast, maximum readability
8. **Touch targets 44px** - Apple HIG compliance
9. **Zero animations** - Instant state changes
10. **Overlay menus** - Context-preserving with 75% black scrim

---

## Acceptance Criteria

- [ ] Can create/delete/rename decks
- [ ] Can view list of cards in collapsed state
- [ ] Can tap to expand/collapse individual cards
- [ ] Can add new cards
- [ ] Can edit card title, content, category
- [ ] Can delete cards (swipe or menu)
- [ ] Can enter reorder mode and drag cards
- [ ] Category decorators display correct colors
- [ ] All touch targets are 44px minimum
- [ ] Zero animations (instant state changes)
- [ ] Monospace fonts for card titles
- [ ] Sharp edges (0px border radius)
- [ ] Black borders, white backgrounds
- [ ] Overlay menus with 75% black scrim
