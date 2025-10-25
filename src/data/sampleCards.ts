/**
 * Sample Card Data for Writer Theme Demo
 *
 * Realistic screenplay cards showing the 6 category types
 * with their respective decorator colors.
 */

import type { NoteCard } from '../screens/CardListScreen';

export const sampleScreenplayCards: NoteCard[] = [
  {
    id: 'card-001',
    title: 'INT. COFFEE SHOP - DAY',
    category: 'location',
    content: `A bustling urban coffee shop. Indie music playing softly. Sarah enters, nervous, scanning the room. She spots Tom at a corner table, already reading the letter she sent.

The morning light streams through large windows. Other patrons work on laptops, oblivious to the drama about to unfold.`,
  },
  {
    id: 'card-002',
    title: 'Sarah meets Tom',
    category: 'character',
    content: `Sarah (28, designer, anxious) approaches Tom's table. Their eyes meet. The history between them is palpable.

TOM: (setting down the letter) You actually came.

SARAH: I had to explain.

CHARACTER ARC: This is Sarah's first step toward honesty after months of avoiding the truth.`,
  },
  {
    id: 'card-003',
    title: 'The Letter Confrontation',
    category: 'conflict',
    content: `Tom slides the letter across the table. Sarah's handwriting, three pages of careful excuses.

TOM: You lied about where you were that night.

SARAH: I can explain—

TOM: (interrupting) I saw you. At the gallery opening. With him.

The central conflict emerges: trust, betrayal, and whether honesty can salvage a relationship already fractured.`,
  },
  {
    id: 'card-004',
    title: '"I was protecting you"',
    category: 'dialogue',
    content: `SARAH: I was protecting you.

TOM: By lying?

SARAH: By not telling you something that would hurt you for no reason.

TOM: You don't get to decide what hurts me.

KEY DIALOGUE: This exchange crystallizes their fundamental incompatibility—Sarah's need to control information vs. Tom's need for transparency.`,
  },
  {
    id: 'card-005',
    title: 'Flashback: The Gallery Opening',
    category: 'theme',
    content: `FLASHBACK - INT. ART GALLERY - NIGHT (3 WEEKS EARLIER)

Sarah in a red dress, laughing with Marcus (her ex-colleague). They're standing too close. The intimacy is undeniable.

THEME: The gap between intention and perception. Sarah sees a harmless conversation; Tom sees betrayal.

The gallery is showing abstract expressionist paintings—chaos organized into meaning. A visual metaphor for their relationship.`,
  },
  {
    id: 'card-006',
    title: 'Tom walks out',
    category: 'action',
    content: `Tom stands abruptly, chair scraping. Other patrons glance over.

He leaves the letter on the table—unread past the first paragraph. Sarah doesn't call after him.

ACTION BEAT: The non-reaction. Sarah letting him leave is as significant as anything she could have said. This is the turning point where she chooses not to fight for the relationship.

Tom pushes through the coffee shop door. It closes with finality.`,
  },
  {
    id: 'card-007',
    title: 'EXT. CITY STREET - CONTINUOUS',
    category: 'location',
    content: `Tom walks down a crowded sidewalk, people flowing around him like water around a stone. The city continues, indifferent to personal heartbreak.

Sarah visible through the coffee shop window, still seated, staring at the letter. The physical distance between them growing with each step.`,
  },
  {
    id: 'card-008',
    title: 'Sarah reads her own letter',
    category: 'theme',
    content: `Sarah picks up the letter Tom abandoned. She reads her own words, seeing them now through his eyes.

"I thought I was doing the right thing..."

THEME: Self-deception. The lies we tell ourselves are more dangerous than the lies we tell others.

She folds the letter carefully, puts it in her bag. A decision forming.`,
  },
  {
    id: 'card-009',
    title: 'The Voicemail',
    category: 'dialogue',
    content: `Sarah pulls out her phone. Calls Tom. It goes to voicemail.

SARAH: (to voicemail) You were right. About all of it. I wasn't protecting you—I was protecting myself. From having to choose. From having to be honest about what I wanted.

(pause)

I want to try again. But only if we can start from complete honesty. No more protecting. No more deciding what the other person can handle.

(another pause)

Call me back. Or don't. But you deserve to know the truth.

She hangs up. Waits. The phone doesn't ring.`,
  },
  {
    id: 'card-010',
    title: 'Midpoint Decision',
    category: 'action',
    content: `Sarah stands, leaving money on the table. She doesn't wait for change.

Outside, she turns right instead of left—away from her apartment, toward the gallery where it all started.

MIDPOINT: Sarah chooses active confrontation instead of passive explanation. She's going to find Marcus and end whatever ambiguity exists between them, then find Tom with a clean slate.

The second half of the story begins.`,
  },
];
