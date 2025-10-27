# Native Mobile Enhancements - Future Roadmap

This document captures the **ideal mobile experience** we're designing for, even though we're building PWA first. These are features that work better (or only work) in native mobile apps.

## Design Philosophy

> "Design for native capabilities, build for web first, enhance when we go native."

We should make design decisions **as if we have native**, then document what's compromised in PWA and enhance later.

---

## 1. Haptic Feedback (Tactile Response)

### What Native Gives Us:
- **UIImpactFeedbackGenerator** (iOS) - Light/medium/heavy impacts
- **Haptics API** (Android) - Vibration patterns
- Subtle vibrations that make interactions feel **physical**

### Where We'd Use It:
```
✓ Card drag start - Light tap (you grabbed it)
✓ Card drop - Medium impact (it landed)
✓ Swipe-to-delete threshold - Light tap (you crossed the line)
✓ Long-press trigger - Medium tap (menu is opening)
✓ Card reorder snap - Light tap (card snapped to position)
✓ Pull-to-refresh - Light tap (refreshing)
✓ Undo action - Light tap (action reversed)
```

### PWA Limitation:
- **Vibration API exists** but is coarse-grained
- iOS Safari: No vibration support at all
- Android PWA: Basic vibration only (200ms buzz, not subtle taps)

### Design Decision:
**Design WITH haptics in mind**. In PWA, gracefully degrade to no haptics. When we go native, add them without redesigning interactions.

**Implementation Note:**
```typescript
// Design for this API pattern (works PWA or native)
const haptics = {
  light: () => navigator.vibrate?.(10) || capacitorHaptics.impact({ style: 'light' }),
  medium: () => navigator.vibrate?.(20) || capacitorHaptics.impact({ style: 'medium' }),
  heavy: () => navigator.vibrate?.(30) || capacitorHaptics.impact({ style: 'heavy' }),
}

// Use throughout code
const handleCardDragStart = () => {
  haptics.light();
  // ... drag logic
}
```

---

## 2. Advanced Gesture Recognition

### What Native Gives Us:
- **UIGestureRecognizer** (iOS) - System-level gesture detection
- **Better edge detection** - Swipe from screen edge
- **Velocity tracking** - Know how fast user swiped
- **Multi-touch** - Pinch, rotate, multi-finger gestures
- **3D Touch / Force Touch** - Pressure-sensitive taps

### Where We'd Use It:

#### 2.1 Edge Swipe Navigation
```
Swipe from left edge → Go back to deck list
Swipe from right edge → Open deck menu
```
**PWA Limitation:** Browser intercepts edge swipes (back/forward navigation)
**Workaround:** Use back button in header for PWA

#### 2.2 Velocity-Based Interactions
```
Fast swipe left → Instant delete (no confirmation)
Slow swipe left → Show delete button (can cancel)
```
**PWA Limitation:** Touch events give coordinates, not velocity
**Workaround:** Calculate velocity manually (timestamp + position delta)

#### 2.3 Pinch to Zoom (Future)
```
Pinch cards list → Zoom out to "index card wall" view
Spread → Zoom in to normal list view
```
**PWA Limitation:** Works on web, but conflicts with browser zoom
**Workaround:** Disable for PWA, enable for native

#### 2.4 Long-Press Context Menu
```
Long-press card → Show context menu (edit, delete, duplicate, change category)
```
**PWA Limitation:** Works fine! (touchstart + timeout)
**Implementation:** Use React touch events, 500ms threshold

### Design Decision:
**Design primary interactions for touch events that work in both**. Save advanced gestures (edge swipes, pinch) for native enhancements.

---

## 3. System Integration (iOS/Android)

### 3.1 Share Sheet
**What Native Gives Us:**
- iOS Share Sheet with native "Share to..." apps
- Android Share menu
- Export deck → Final Draft, Google Docs, Dropbox, etc.

**PWA Limitation:**
- **Web Share API** exists but limited file type support
- iOS: Works for text, links, NOT for .pdf or .fountain files
- Android: Better support, can share files

**Design Decision:**
```
Primary: Export button → Share sheet (native feel)
Fallback (PWA): Export button → Download file (browser download)
```

**Implementation:**
```typescript
const exportDeck = async (deck, format) => {
  const file = generateFile(deck, format); // .txt, .pdf, .fountain
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    // Native-like share (works on Android PWA)
    await navigator.share({ files: [file], title: deck.name });
  } else {
    // Fallback: Browser download
    downloadFile(file);
  }
}
```

---

### 3.2 Home Screen Widgets (Native Only)

**What Native Gives Us:**
- iOS Widgets - Show current deck progress on home screen
- Android Widgets - Quick add card, see card count

**Widget Ideas:**
```
┌─────────────────────────┐
│ My Screenplay           │
│ 47 cards                │
│                         │
│ [▓▓▓▓▓▓▓░░░] 65%        │ ← Progress bar
│                         │
│ Last: "Climax scene"    │
└─────────────────────────┘

┌─────────────────────────┐
│ NOTECARDS               │
│                         │
│ [+ Quick Add Card]      │ ← Button opens app with new card
└─────────────────────────┘
```

**PWA Limitation:** No widgets at all
**Design Decision:** Nice-to-have for native launch, not critical

---

### 3.3 Shortcuts / Siri Integration (iOS)

**What Native Gives Us:**
- Siri Shortcuts - "Hey Siri, add a card to my screenplay"
- App Shortcuts - Long-press app icon → Quick actions

**Shortcuts Ideas:**
```
App Icon Long Press:
- Add Card
- Open Current Deck
- View All Decks

Siri:
"Add card to [deck name]" → Opens editor with deck pre-selected
"Show me my screenplay cards" → Opens card list
```

**PWA Limitation:** No Siri integration
**Design Decision:** Native enhancement, not required for PWA

---

### 3.4 Biometric Authentication (Face ID / Touch ID)

**What Native Gives Us:**
- Face ID / Touch ID for private decks
- System-level security

**Use Cases:**
```
Private deck → Requires Face ID to open
Lock mode → Requires authentication to exit
```

**PWA Limitation:**
- **Web Authentication API** (WebAuthn) exists for login
- NOT for in-app content protection
- Can't lock individual decks

**Design Decision:**
- PWA: No deck-level privacy (rely on device lock)
- Native: Add "Private Deck" feature with Face ID

---

## 4. File System & Storage

### 4.1 File System Access

**What Native Gives Us:**
- Save directly to Files app (iOS) / storage (Android)
- Import .fountain, .pdf files from Files
- Backup/restore to iCloud Drive, Google Drive

**PWA Limitation:**
- **File System Access API** (Chrome only, not Safari)
- iOS Safari: Download to Downloads folder only
- No direct file picker integration

**Design Decision:**
```
Export Flow:
Native: "Save to Files" → File picker → Choose location
PWA: "Download" → Browser downloads folder

Import Flow:
Native: "Import File" → File picker → Load file
PWA: "Upload File" → <input type="file"> → Load file
```

---

### 4.2 Storage Limits

**Native:**
- Essentially unlimited storage (device capacity)
- No quota warnings

**PWA:**
- iOS Safari: ~50MB IndexedDB limit (then asks permission)
- Chrome: ~6% of free disk space
- Can be evicted if device is low on storage

**Design Decision:**
- Store deck metadata in Firestore (always synced)
- Cache cards locally for offline (can be evicted)
- Native: Store everything locally, sync to Firebase

---

## 5. Performance & Rendering

### 5.1 Scroll Performance

**Native:**
- 120Hz ProMotion displays on iOS
- Native scroll inertia (feels fluid)
- Better memory management for long lists

**PWA:**
- Limited to 60fps on most browsers
- JavaScript-based scroll (slightly less smooth)
- Can use `react-window` for virtualization

**Design Decision:**
- Virtualize lists with 100+ cards (both PWA and native)
- Native will feel smoother, but both work

---

### 5.2 Drag & Drop Performance

**Native:**
- System-level drag gestures (smooth, no jank)
- Shadow follows finger perfectly

**PWA:**
- JavaScript touch events (can have slight lag)
- Needs careful optimization

**Design Decision:**
- Use `react-beautiful-dnd` or similar (works PWA)
- Optimize for 60fps minimum
- Native enhancements later for 120Hz

---

## 6. Keyboard Handling

### 6.1 Keyboard Avoidance

**Native:**
- System automatically shifts content above keyboard
- `KeyboardAvoidingView` (React Native)
- Smooth animations

**PWA:**
- Viewport resizes when keyboard opens
- Can cause layout shift
- Need manual `scrollIntoView` for focused inputs

**Design Decision:**
```
Card Editor (full screen):
- Native: Auto-adjusts, smooth
- PWA: Use `visualViewport` API to detect keyboard, scroll focused input into view
```

**Implementation:**
```typescript
// PWA keyboard handling
useEffect(() => {
  const handleResize = () => {
    if (document.activeElement?.tagName === 'INPUT') {
      document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  window.visualViewport?.addEventListener('resize', handleResize);
  return () => window.visualViewport?.removeEventListener('resize', handleResize);
}, []);
```

---

### 6.2 Input Accessories (iOS)

**Native:**
- Custom toolbar above keyboard (Done, Next, Previous buttons)
- Markdown shortcuts toolbar

**PWA:**
- No custom keyboard accessories
- Standard browser keyboard

**Design Decision:**
- Native: Add custom toolbar with "Done", "Bold", "Italic" for card editor
- PWA: Standard keyboard only

---

## 7. Background Sync & Notifications

### 7.1 Background Sync

**Native:**
- Background sync when app is closed
- Push changes to Firebase even when app isn't open

**PWA:**
- **Background Sync API** (Chrome only, not iOS)
- iOS: No background sync at all

**Design Decision:**
- **Local-first architecture** - Save locally immediately, sync when online
- Native: Better sync reliability
- PWA: Works fine when app is open, but changes while closed won't sync

---

### 7.2 Push Notifications

**Native:**
- Reliable push notifications (Firebase Cloud Messaging)
- Can trigger even when app closed

**PWA:**
- Android: Push notifications work (with limitations)
- iOS: **No push notifications in PWA at all** (as of iOS 17)

**Notification Use Cases:**
```
Collaboration notifications (future):
- "Alex added 3 cards to 'Screenplay'"
- "Deck 'Novel' was shared with you"

Reminder notifications:
- "You haven't worked on 'Screenplay' in 3 days"
```

**Design Decision:**
- **Don't design for notifications in v1**
- Add when we go native (collaboration feature)

---

## 8. App Lifecycle & State

### 8.1 App Backgrounding

**Native:**
- Clear lifecycle events (foreground, background, killed)
- Save state before backgrounding

**PWA:**
- `visibilitychange` event (good enough)
- Auto-save should handle this

**Design Decision:**
- Auto-save on every change (both PWA and native)
- Native: Listen to lifecycle events explicitly
- PWA: Use `visibilitychange` + auto-save

---

### 8.2 App Termination

**Native:**
- OS can kill app in background (save state)

**PWA:**
- Browser can evict service worker
- IndexedDB persists

**Design Decision:**
- **Never rely on in-memory state**
- Persist to IndexedDB or Firestore on every change
- Works same in PWA and native

---

## Summary: Design Decisions Matrix

| Feature | Design For | PWA Support | Native Enhancement |
|---------|-----------|-------------|-------------------|
| **Haptic feedback** | ✅ Include in designs | ⚠️ Android only, coarse | ✅ iOS + refined |
| **Long-press menu** | ✅ Include | ✅ Works great | ✅ Same |
| **Swipe-to-delete** | ✅ Include | ✅ Works great | ✅ Add haptics |
| **Drag-and-drop** | ✅ Include | ✅ Works (60fps) | ✅ Smoother (120fps) |
| **Edge swipes** | ❌ Skip for now | ❌ Conflicts with browser | ✅ Native only |
| **Share sheet** | ✅ Include | ⚠️ Text only | ✅ Files too |
| **Biometric auth** | ❌ Skip for v1 | ❌ Not available | ✅ Native feature |
| **Widgets** | ❌ Skip for v1 | ❌ Not available | ✅ Native feature |
| **Push notifications** | ❌ Skip for v1 | ❌ iOS blocked | ✅ Native feature |
| **File system** | ✅ Include (export) | ⚠️ Downloads only | ✅ Full access |
| **Keyboard avoidance** | ✅ Include | ⚠️ Manual handling | ✅ Automatic |
| **Background sync** | ⚠️ Design for online-first | ⚠️ Limited | ✅ Reliable |

---

## Next Steps

1. **Build PWA with these interactions:**
   - Tap, long-press, swipe, drag-and-drop
   - Overlay menus, bottom sheets
   - Export (download for now, share sheet when native)
   - Keyboard handling (manual scrollIntoView)

2. **Document "Native TODO" comments in code:**
   ```typescript
   // NATIVE TODO: Add haptic feedback on drag start
   // NATIVE TODO: Use Share Sheet instead of download
   // NATIVE TODO: Add keyboard accessory toolbar
   ```

3. **When we wrap in Capacitor:**
   - Add haptic feedback plugin
   - Enable Share Sheet with files
   - Add keyboard plugins
   - Background sync improvements

---

## Acceptance Criteria

- [ ] All interaction patterns documented (tap, long-press, swipe, drag)
- [ ] Native enhancements identified with "NATIVE TODO" comments
- [ ] PWA fallbacks specified for each feature
- [ ] Design decisions don't paint us into a corner (can enhance later)
- [ ] No features that ONLY work native (unless marked as "Native v2")
