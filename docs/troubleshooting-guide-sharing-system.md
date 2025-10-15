# Troubleshooting Guide: Sharing System Issues

## 🚨 Quick Resolution Index

### Most Common Issues (95% of Support Tickets)

| Issue | Quick Fix | Details |
|-------|-----------|---------|
| Can't share deck | Check if you're the owner | [→ Section 1.1](#11-sharing-permission-denied) |
| Email not found | User needs to create account first | [→ Section 1.2](#12-user-not-found-errors) |
| Invitation not received | Check spam folder / resend | [→ Section 1.3](#13-invitation-delivery-issues) |
| Can't change roles | Only owners can change editor roles | [→ Section 1.4](#14-role-change-failures) |
| Collaborator list empty | Check network / refresh page | [→ Section 1.5](#15-ui-display-issues) |

### Emergency Response

**🔥 System Down:** [Emergency Procedures](#6-emergency-procedures)  
**🚨 Data Loss:** [Data Recovery](#7-data-recovery-procedures)  
**⚡ Performance Issues:** [Performance Troubleshooting](#4-performance-issues)

---

## 1. User-Facing Issues

### 1.1 Sharing Permission Denied

#### Symptoms
- "Insufficient permissions to share" error message
- Share button is grayed out or missing
- Error when clicking "Add" in share dialog

#### Diagnosis Steps

1. **Check User Role:**
```typescript
// Debug console (F12 → Console)
console.log('Current user:', auth.currentUser?.uid)
console.log('Deck owner:', selectedDeck.ownerId)
console.log('User role:', selectedDeck.roles[auth.currentUser?.uid])
```

2. **Verify Deck Ownership:**
- Only deck owners can share decks
- Editors cannot add new collaborators (by design)
- Viewers have read-only access

#### Quick Fixes

✅ **If you're the owner but still can't share:**
1. Refresh the page (Ctrl+F5)
2. Log out and log back in
3. Check if sharing feature is enabled for your account

✅ **If you're not the owner:**
1. Ask the deck owner to share it with you as an editor
2. Request the owner to add the new collaborator
3. Create your own copy of the deck

#### Advanced Troubleshooting

```typescript
// Check authentication state
firebase.auth().onAuthStateChanged(user => {
  console.log('Auth state:', user ? 'Logged in' : 'Not logged in')
  if (user) {
    console.log('User ID:', user.uid)
    console.log('Email verified:', user.emailVerified)
  }
})

// Verify deck permissions
const checkPermissions = async (deckId) => {
  const deckDoc = await getDoc(doc(db, 'decks', deckId))
  const data = deckDoc.data()
  const currentUser = auth.currentUser
  
  console.log('Permissions check:', {
    isOwner: data.ownerId === currentUser?.uid,
    userRole: data.roles[currentUser?.uid],
    canShare: data.ownerId === currentUser?.uid || data.roles[currentUser?.uid] === 'editor'
  })
}
```

### 1.2 User Not Found Errors

#### Symptoms
- "User not found" when entering email address
- Email appears valid but system can't find user
- Sharing fails with user lookup error

#### Root Causes
1. **User hasn't created an account yet**
2. **Email address mismatch** (typos, case sensitivity)
3. **User account exists but email not verified**
4. **Cache inconsistency** in user lookup service

#### Resolution Steps

✅ **Step 1: Verify Email Address**
1. Double-check spelling and format
2. Try copy-pasting the email address
3. Confirm with the user their exact email

✅ **Step 2: User Account Check**
1. Ask the user to visit the app and create an account
2. Verify they can log in successfully
3. Ensure their email is verified

✅ **Step 3: Try Invitation System**
1. Modern system automatically creates pending invitations
2. User will receive email when they create account
3. Invitation will be automatically accepted

#### Advanced Debugging

```typescript
// Test user lookup manually
const testUserLookup = async (email) => {
  try {
    const result = await optimizedUserLookup.lookupUserIdByEmail(email)
    console.log('User found:', result)
  } catch (error) {
    console.log('User lookup failed:', error.message)
    
    // Check if it's a cache issue
    optimizedUserLookup.clearCache()
    try {
      const retryResult = await optimizedUserLookup.lookupUserIdByEmail(email)
      console.log('Retry successful:', retryResult)
    } catch (retryError) {
      console.log('User definitely not found:', retryError.message)
    }
  }
}
```

### 1.3 Invitation Delivery Issues

#### Symptoms
- User says they didn't receive invitation email
- Invitation appears as "pending" but never delivered
- Email was sent but user can't find it

#### Troubleshooting Steps

✅ **Step 1: Check Spam/Junk Folders**
1. Ask user to check spam/junk folder
2. Search for emails from your domain
3. Mark as "not spam" if found

✅ **Step 2: Verify Email Settings**
1. Confirm user's email address is correct
2. Check if email provider has strict filtering
3. Try alternative email address if available

✅ **Step 3: Resend Invitation**
1. Revoke existing invitation
2. Send new invitation
3. Use "Copy Link" feature as backup

#### Email Service Debugging

```typescript
// Check invitation status
const checkInviteStatus = async (deckId) => {
  const invites = await listPendingInvites(deckId)
  console.log('Pending invites:', invites)
  
  invites.forEach(invite => {
    console.log('Invite details:', {
      email: invite.emailLower,
      status: invite.status,
      created: invite.createdAt,
      expires: invite.expiresAt,
      isExpired: invite.expiresAt < new Date()
    })
  })
}

// Test email service connectivity
const testEmailService = async () => {
  try {
    const status = await emailService.getStatus()
    console.log('Email service status:', status)
  } catch (error) {
    console.error('Email service error:', error)
  }
}
```

### 1.4 Role Change Failures

#### Symptoms
- Can't change collaborator from viewer to editor
- Role dropdown is disabled
- "Failed to update role" error message

#### Common Causes
1. **Insufficient permissions** (only owners can change roles)
2. **Trying to change owner role** (not allowed)
3. **Network connectivity issues**
4. **Cache synchronization problems**

#### Resolution Steps

✅ **Permission Check:**
1. Verify you're the deck owner
2. Confirm you're not trying to change your own role
3. Ensure target user is not the deck owner

✅ **Technical Solutions:**
1. Refresh the page to clear cache
2. Try logging out and back in
3. Check browser console for error messages

#### Role Management Debugging

```typescript
// Test role change operation
const testRoleChange = async (deckId, userId, newRole) => {
  try {
    console.log('Attempting role change:', { deckId, userId, newRole })
    
    const result = await optimizedDeckSharing.updateUserRole(
      deckId, 
      userId, 
      newRole, 
      auth.currentUser.uid
    )
    
    console.log('Role change result:', result)
  } catch (error) {
    console.error('Role change failed:', error)
    
    // Additional debugging
    const deckDoc = await getDoc(doc(db, 'decks', deckId))
    const deckData = deckDoc.data()
    
    console.log('Debug info:', {
      currentUserIsOwner: deckData.ownerId === auth.currentUser.uid,
      targetUserCurrentRole: deckData.roles[userId],
      targetUserIsOwner: deckData.ownerId === userId
    })
  }
}
```

### 1.5 UI Display Issues

#### Symptoms
- Collaborator list appears empty but collaborators exist
- Loading spinner never stops
- Share dialog won't open
- UI elements not responding

#### Quick Fixes

✅ **Refresh Solutions:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Try incognito/private mode
4. Restart browser

✅ **Browser Compatibility:**
1. Update browser to latest version
2. Disable browser extensions
3. Try different browser
4. Check JavaScript console for errors

#### UI Debugging

```typescript
// Check component state
const debugUIState = () => {
  // Check if feature flag is enabled
  console.log('Sharing feature enabled:', FEATURE_DECK_SHARING)
  
  // Check authentication state
  console.log('User authenticated:', !!auth.currentUser)
  
  // Check deck data
  console.log('Selected deck:', selectedDeck)
  console.log('Collaborators:', selectedDeck?.roles)
  
  // Check loading states
  console.log('Loading states:', {
    sharingLoading: isShareDialogLoading,
    invitesLoading: areInvitesLoading
  })
}

// Force component re-render
const forceRefresh = () => {
  // Clear all caches
  optimizedUserLookup.clearCache()
  optimizedDeckSharing.clearCache()
  
  // Reload deck data
  window.location.reload()
}
```

---

## 2. Developer Issues

### 2.1 Service Integration Errors

#### Symptoms
- TypeScript compilation errors with new services
- Runtime errors when calling optimized services
- Inconsistent behavior between old and new implementations

#### Common Integration Issues

✅ **Import Path Errors:**
```typescript
// ❌ Wrong
import optimizedDeckSharing from './optimized-deck-sharing'

// ✅ Correct
import optimizedDeckSharing from '../services/optimized-deck-sharing'
```

✅ **Hook Usage Errors:**
```typescript
// ❌ Wrong - missing current user
const { shareWithUser } = useShareDialog()

// ✅ Correct - with current user context
const { shareWithUser } = useShareDialog(user.uid, {
  onSuccess: (msg) => showToast(msg, 'success'),
  onError: (err) => showToast(err, 'error')
})
```

#### Service Integration Debugging

```typescript
// Test service availability
const testServiceIntegration = async () => {
  try {
    // Test optimized user lookup
    const testEmail = 'test@example.com'
    await optimizedUserLookup.lookupUserIdByEmail(testEmail)
    console.log('✅ User lookup service working')
  } catch (error) {
    console.error('❌ User lookup service error:', error)
  }
  
  try {
    // Test optimized deck sharing
    const status = await optimizedDeckSharing.getSharingStatus('test-deck-id')
    console.log('✅ Deck sharing service working')
  } catch (error) {
    console.error('❌ Deck sharing service error:', error)
  }
}
```

### 2.2 Cache-Related Issues

#### Symptoms
- Stale data displayed in UI after updates
- Inconsistent user lookup results
- Performance degradation over time

#### Cache Debugging

```typescript
// Inspect cache state
const debugCacheState = () => {
  console.log('User lookup cache stats:', {
    size: optimizedUserLookup.getCacheSize(),
    hitRate: optimizedUserLookup.getCacheHitRate(),
    oldestEntry: optimizedUserLookup.getOldestCacheEntry()
  })
  
  console.log('Sharing cache stats:', {
    size: optimizedDeckSharing.getCacheSize(),
    lastClear: optimizedDeckSharing.getLastCacheClear()
  })
}

// Force cache refresh
const refreshCaches = () => {
  optimizedUserLookup.clearCache()
  optimizedDeckSharing.clearCache()
  console.log('All caches cleared')
}
```

#### Cache Configuration Issues

```typescript
// Verify cache configuration
const validateCacheConfig = () => {
  const config = {
    userLookupTTL: process.env.REACT_APP_USER_CACHE_TTL || '300000',
    shareCacheTTL: process.env.REACT_APP_SHARE_CACHE_TTL || '300000',
    maxCacheSize: process.env.REACT_APP_MAX_CACHE_SIZE || '1000'
  }
  
  console.log('Cache configuration:', config)
  
  // Validate TTL values
  Object.entries(config).forEach(([key, value]) => {
    if (isNaN(Number(value))) {
      console.warn(`⚠️ Invalid cache config: ${key} = ${value}`)
    }
  })
}
```

### 2.3 Database Query Issues

#### Symptoms
- Slow query performance
- "Missing index" errors in console
- Firestore quota exceeded warnings

#### Index Optimization

```typescript
// Test query performance
const benchmarkQueries = async () => {
  const queries = [
    {
      name: 'Owned Decks',
      query: query(
        collection(db, 'decks'),
        where('ownerId', '==', 'test-user-id'),
        orderBy('updatedAt', 'desc'),
        limit(20)
      )
    },
    {
      name: 'Collaborative Decks',
      query: query(
        collection(db, 'decks'),
        where('roles.test-user-id', 'in', ['editor', 'viewer']),
        orderBy('updatedAt', 'desc'),
        limit(20)
      )
    }
  ]
  
  for (const { name, query: q } of queries) {
    const start = performance.now()
    try {
      const snapshot = await getDocs(q)
      const duration = performance.now() - start
      console.log(`${name}: ${duration.toFixed(2)}ms (${snapshot.size} docs)`)
    } catch (error) {
      console.error(`${name} failed:`, error)
    }
  }
}
```

#### Index Deployment

```bash
# Check current indexes
firebase firestore:indexes:list

# Deploy optimized indexes
firebase deploy --only firestore:indexes

# Monitor index build progress
firebase firestore:indexes:list --project=your-project-id
```

---

## 3. Performance Issues

### 3.1 Slow Share Dialog Opening

#### Symptoms
- Share dialog takes >2 seconds to open
- Loading spinner shows for extended time
- Browser becomes unresponsive

#### Performance Debugging

```typescript
// Measure dialog opening performance
const measureDialogPerformance = async () => {
  const start = performance.now()
  
  // Simulate dialog opening
  console.time('shareDialogOpen')
  
  try {
    // Load collaborators
    const collaboratorsStart = performance.now()
    const collaborators = Object.entries(deck.roles || {})
    const collaboratorsTime = performance.now() - collaboratorsStart
    
    // Load pending invites
    const invitesStart = performance.now()
    const invites = await listPendingInvites(deck.id)
    const invitesTime = performance.now() - invitesStart
    
    console.timeEnd('shareDialogOpen')
    
    console.log('Performance breakdown:', {
      collaborators: `${collaboratorsTime.toFixed(2)}ms`,
      invites: `${invitesTime.toFixed(2)}ms`,
      total: `${(performance.now() - start).toFixed(2)}ms`
    })
    
  } catch (error) {
    console.error('Performance test failed:', error)
  }
}
```

#### Optimization Solutions

✅ **Pre-loading Data:**
```typescript
// Pre-load invite data when deck is selected
useEffect(() => {
  if (selectedDeck) {
    // Pre-fetch invites in background
    listPendingInvites(selectedDeck.id).then(setInviteCache)
  }
}, [selectedDeck])
```

✅ **Lazy Loading:**
```typescript
// Load heavy components only when needed
const LazyShareDialog = lazy(() => import('./ShareDeckDialog'))

// Use Suspense for better loading UX
<Suspense fallback={<ShareDialogSkeleton />}>
  <LazyShareDialog deck={deck} />
</Suspense>
```

### 3.2 High Memory Usage

#### Symptoms
- Browser tab uses excessive memory
- Browser becomes sluggish over time
- Memory warnings in developer tools

#### Memory Profiling

```typescript
// Monitor memory usage
const monitorMemory = () => {
  if ('memory' in performance) {
    const memory = performance.memory
    console.log('Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// Check for memory leaks
const checkForLeaks = () => {
  // Count active listeners
  const listenerCount = document.querySelectorAll('*')
    .length // Approximate listener count
  
  console.log('Potential memory usage:', {
    domNodes: document.querySelectorAll('*').length,
    estimatedListeners: listenerCount,
    cacheSize: optimizedUserLookup.getCacheSize()
  })
}
```

#### Memory Optimization

```typescript
// Implement proper cleanup
useEffect(() => {
  const cleanup = () => {
    // Clear caches when component unmounts
    optimizedUserLookup.clearCache()
    optimizedDeckSharing.clearCache()
  }
  
  return cleanup
}, [])

// Limit cache size
const limitCacheSize = () => {
  const MAX_CACHE_ENTRIES = 100
  
  if (optimizedUserLookup.getCacheSize() > MAX_CACHE_ENTRIES) {
    optimizedUserLookup.evictOldestEntries(50)
  }
}
```

---

## 4. Security Issues

### 4.1 Permission Bypass Attempts

#### Symptoms
- Users gaining unauthorized access to decks
- Role elevation without proper authorization
- Firestore security rule violations

#### Security Validation

```typescript
// Test security rules
const testSecurity = async () => {
  const testCases = [
    {
      name: 'Non-owner cannot share deck',
      test: async () => {
        // Attempt sharing as non-owner
        const result = await optimizedDeckSharing.shareWithUser(
          { deckId: 'test-deck', userEmail: 'test@example.com', role: 'viewer' },
          'non-owner-user-id'
        )
        return !result.success // Should fail
      }
    },
    {
      name: 'Viewer cannot change roles',
      test: async () => {
        const result = await optimizedDeckSharing.updateUserRole(
          'test-deck',
          'target-user',
          'editor',
          'viewer-user-id'
        )
        return !result.success // Should fail
      }
    }
  ]
  
  for (const testCase of testCases) {
    try {
      const passed = await testCase.test()
      console.log(`${testCase.name}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
    } catch (error) {
      console.log(`${testCase.name}: ✅ PASS (threw expected error)`)
    }
  }
}
```

#### Security Hardening

```typescript
// Additional permission checks
const validatePermissions = async (deckId: string, userId: string, operation: string) => {
  const deckDoc = await getDoc(doc(db, 'decks', deckId))
  const deckData = deckDoc.data()
  
  const checks = {
    userExists: !!userId,
    deckExists: deckDoc.exists(),
    isOwner: deckData?.ownerId === userId,
    isEditor: deckData?.roles?.[userId] === 'editor',
    isViewer: deckData?.roles?.[userId] === 'viewer'
  }
  
  console.log('Permission validation:', checks)
  
  const canPerform = {
    share: checks.isOwner,
    editRoles: checks.isOwner,
    viewDeck: checks.isOwner || checks.isEditor || checks.isViewer
  }
  
  return canPerform[operation] || false
}
```

### 4.2 Data Exposure Issues

#### Symptoms
- Users seeing data they shouldn't access
- Sensitive information in browser console
- Client-side filtering bypassed

#### Data Security Audit

```typescript
// Audit data exposure
const auditDataExposure = () => {
  console.group('🔍 Data Security Audit')
  
  // Check for sensitive data in state
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /private/i
  ]
  
  const stateString = JSON.stringify(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
  
  sensitivePatterns.forEach(pattern => {
    if (pattern.test(stateString)) {
      console.warn('⚠️ Potential sensitive data exposure:', pattern)
    }
  })
  
  // Check localStorage for sensitive data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(key) || pattern.test(value || '')) {
        console.warn('⚠️ Sensitive data in localStorage:', key)
      }
    })
  }
  
  console.groupEnd()
}
```

---

## 5. Data Recovery Procedures

### 5.1 Accidentally Removed Collaborators

#### Recovery Steps

✅ **Check Recent Activity:**
```typescript
// Look for recent role changes in Firestore
const checkRecentActivity = async (deckId: string) => {
  const deckRef = doc(db, 'decks', deckId)
  const docSnap = await getDoc(deckRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data()
    console.log('Current collaborators:', data.roles)
    console.log('Last updated:', data.updatedAt)
    
    // Check for backup data if available
    const backupRef = doc(db, 'deck_backups', deckId)
    const backupSnap = await getDoc(backupRef)
    
    if (backupSnap.exists()) {
      console.log('Backup found:', backupSnap.data())
    }
  }
}
```

✅ **Manual Recovery:**
```typescript
// Restore collaborator access
const restoreCollaborator = async (deckId: string, userId: string, role: string) => {
  try {
    const result = await optimizedDeckSharing.shareWithUser(
      { deckId, userEmail: 'user@example.com', role: role as any },
      'owner-user-id'
    )
    
    console.log('Restoration result:', result)
  } catch (error) {
    console.error('Manual restoration failed:', error)
  }
}
```

### 5.2 Corrupted Deck Data

#### Symptoms
- Deck data appears incomplete
- Collaborator list inconsistencies
- Role information missing

#### Data Validation

```typescript
// Validate deck data integrity
const validateDeckIntegrity = async (deckId: string) => {
  const deckDoc = await getDoc(doc(db, 'decks', deckId))
  const data = deckDoc.data()
  
  const issues = []
  
  // Check required fields
  const requiredFields = ['title', 'ownerId', 'createdAt', 'updatedAt']
  requiredFields.forEach(field => {
    if (!data[field]) {
      issues.push(`Missing required field: ${field}`)
    }
  })
  
  // Check data consistency
  const collaboratorIds = new Set(data.collaboratorIds || [])
  const roleIds = new Set(Object.keys(data.roles || {}))
  
  // Find orphaned collaborators
  collaboratorIds.forEach(id => {
    if (!roleIds.has(id) && id !== data.ownerId) {
      issues.push(`Collaborator ${id} missing from roles`)
    }
  })
  
  // Find orphaned roles
  roleIds.forEach(id => {
    if (!collaboratorIds.has(id) && id !== data.ownerId) {
      issues.push(`Role ${id} missing from collaboratorIds`)
    }
  })
  
  console.log('Data integrity check:', {
    deckId,
    issues,
    isValid: issues.length === 0
  })
  
  return issues
}
```

---

## 6. Emergency Procedures

### 6.1 Service Outage Response

#### Immediate Actions (First 15 minutes)

1. **Assess Impact:**
   - Check if issue is user-specific or system-wide
   - Verify Firebase service status
   - Test with different user accounts

2. **Enable Fallback Mode:**
```typescript
// Emergency fallback configuration
const EMERGENCY_CONFIG = {
  DISABLE_SHARING: true,
  READ_ONLY_MODE: true,
  CACHE_ONLY: true,
  SHOW_MAINTENANCE_MESSAGE: true
}

// Apply emergency configuration
Object.assign(window.EMERGENCY_CONFIG, EMERGENCY_CONFIG)
```

3. **Communication:**
   - Post status update on internal channels
   - Prepare user communication if needed
   - Alert development team

#### Recovery Procedures

✅ **Service Restoration:**
```typescript
// Test service recovery
const testServiceRecovery = async () => {
  const tests = [
    () => optimizedUserLookup.lookupUserIdByEmail('test@example.com'),
    () => optimizedDeckSharing.getSharingStatus('test-deck'),
    () => listPendingInvites('test-deck')
  ]
  
  for (const test of tests) {
    try {
      await test()
      console.log('✅ Service test passed')
    } catch (error) {
      console.error('❌ Service test failed:', error)
    }
  }
}
```

### 6.2 Data Corruption Response

#### Detection
```typescript
// Automated corruption detection
const detectDataCorruption = async () => {
  const sampleDecks = await getDocs(
    query(collection(db, 'decks'), limit(10))
  )
  
  const corruptionIssues = []
  
  for (const doc of sampleDecks.docs) {
    const issues = await validateDeckIntegrity(doc.id)
    if (issues.length > 0) {
      corruptionIssues.push({ deckId: doc.id, issues })
    }
  }
  
  if (corruptionIssues.length > 0) {
    console.error('🚨 Data corruption detected:', corruptionIssues)
    // Trigger alerts
  }
  
  return corruptionIssues
}
```

#### Recovery Actions
1. **Stop all write operations**
2. **Restore from backup if available**
3. **Manual data repair for affected records**
4. **Verify integrity before resuming operations**

---

## 7. Monitoring and Alerting

### 7.1 Health Check Implementation

```typescript
// System health monitoring
const performHealthCheck = async () => {
  const checks = {
    authentication: false,
    database: false,
    sharing: false,
    caching: false
  }
  
  try {
    // Test authentication
    checks.authentication = !!auth.currentUser
    
    // Test database connectivity
    await getDoc(doc(db, 'health', 'check'))
    checks.database = true
    
    // Test sharing service
    await optimizedDeckSharing.getSharingStatus('health-check')
    checks.sharing = true
    
    // Test caching
    checks.caching = optimizedUserLookup.getCacheSize() >= 0
    
  } catch (error) {
    console.error('Health check failed:', error)
  }
  
  const isHealthy = Object.values(checks).every(Boolean)
  
  console.log('System health:', { ...checks, overall: isHealthy })
  
  return { checks, isHealthy }
}
```

### 7.2 Performance Monitoring

```typescript
// Performance metrics collection
const collectPerformanceMetrics = () => {
  const metrics = {
    // User experience metrics
    shareDialogOpenTime: 0,
    collaboratorAddTime: 0,
    roleChangeTime: 0,
    
    // System metrics
    cacheHitRate: optimizedUserLookup.getCacheHitRate(),
    memoryUsage: performance.memory?.usedJSHeapSize || 0,
    
    // Error rates
    sharingErrorRate: 0,
    lookupErrorRate: 0
  }
  
  // Send to monitoring service
  console.log('Performance metrics:', metrics)
  
  return metrics
}
```

---

## 8. Contact and Escalation

### 8.1 Support Channels

**🎯 Quick Resolution (< 5 minutes):**
- Check this troubleshooting guide first
- Try browser refresh and cache clearing
- Verify user permissions and authentication

**📞 Internal Support:**
- Development Team: [internal-dev-channel]
- DevOps Team: [internal-ops-channel]
- Product Team: [internal-product-channel]

**🚨 Emergency Escalation:**
- System Outage: [emergency-contact]
- Security Incident: [security-team]
- Data Loss: [data-recovery-team]

### 8.2 Issue Reporting Template

When reporting issues, include:

```
**Issue Summary:** Brief description of the problem

**Environment:**
- Browser: [Chrome/Firefox/Safari] version
- Platform: [Windows/Mac/Linux/Mobile]
- User ID: [if known]
- Deck ID: [if applicable]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:** What should happen

**Actual Result:** What actually happened

**Console Errors:** Any errors from browser developer console

**Screenshots:** [if applicable]

**Urgency:** [Low/Medium/High/Critical]
```

---

## 9. Appendix

### 9.1 Error Code Reference

| Code | Description | User Action | Developer Action |
|------|-------------|-------------|------------------|
| `PERMISSION_DENIED` | User lacks permissions | Contact deck owner | Check user role validation |
| `USER_NOT_FOUND` | Email not in system | User needs account | Implement invitation fallback |
| `INVITE_EXPIRED` | Invitation has expired | Request new invite | Check expiration logic |
| `CACHE_TIMEOUT` | Cache operation timed out | Refresh page | Check cache configuration |
| `NETWORK_ERROR` | Connection issue | Check internet | Verify Firebase connectivity |
| `QUOTA_EXCEEDED` | Too many operations | Wait and retry | Check usage limits |

### 9.2 Performance Benchmarks

| Operation | Target Time | Warning Threshold | Critical Threshold |
|-----------|-------------|-------------------|-------------------|
| Share Dialog Open | < 500ms | > 1s | > 3s |
| Add Collaborator | < 1s | > 2s | > 5s |
| Role Change | < 500ms | > 1s | > 3s |
| User Lookup | < 200ms | > 500ms | > 1s |
| Cache Hit Rate | > 80% | < 70% | < 50% |

### 9.3 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Share Dialog | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| File Sharing | ✅ 90+ | ✅ 88+ | ⚠️ 15+ | ✅ 90+ |
| Real-time Updates | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Offline Support | ✅ 90+ | ✅ 88+ | ⚠️ 15+ | ✅ 90+ |

**Legend:** ✅ Full Support, ⚠️ Partial Support, ❌ Not Supported

This troubleshooting guide provides comprehensive solutions for the most common sharing system issues, enabling rapid problem resolution and system recovery.