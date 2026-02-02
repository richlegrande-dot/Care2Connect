# Phase 1.8 Visual Verification Guide

## Quick Component Test Page

Copy this code into a test page to verify all new components:

```tsx
'use client'

import { useState } from 'react'
import { SkeletonText, SkeletonCard, SkeletonTable, EmptyState, Banner } from '@/components/GlobalStates'

export default function Phase18TestPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [loading, setLoading] = useState(true)

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      <h1 className="cc-heading-xl">Phase 1.8 Component Gallery</h1>

      {/* Banner Tests */}
      <section>
        <h2 className="cc-heading-lg mb-4">1. Banner System</h2>
        <div className="space-y-4">
          {showBanner && (
            <Banner
              type="success"
              title="Success"
              message="Your changes have been saved successfully."
              dismissible
              onDismiss={() => setShowBanner(false)}
            />
          )}
          <Banner
            type="error"
            message="Unable to process your request. Please try again."
          />
          <Banner
            type="warning"
            title="Warning"
            message="This action cannot be undone. Please confirm."
          />
          <Banner
            type="info"
            message="Your session will expire in 5 minutes."
          />
        </div>
      </section>

      {/* Loading Skeleton Tests */}
      <section>
        <h2 className="cc-heading-lg mb-4">2. Loading Skeletons</h2>
        <button 
          onClick={() => setLoading(!loading)}
          className="btn-secondary mb-4"
        >
          Toggle Loading State
        </button>
        
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonTable rows={4} columns={5} />
            <div className="space-y-2">
              <SkeletonText large width="60%" />
              <SkeletonText width="100%" />
              <SkeletonText width="80%" />
            </div>
          </div>
        ) : (
          <div className="card">
            <h3 className="cc-heading-md mb-2">Content Loaded</h3>
            <p className="cc-body">This is the actual content that replaced the skeleton.</p>
          </div>
        )}
      </section>

      {/* Empty State Tests */}
      <section>
        <h2 className="cc-heading-lg mb-4">3. Empty States</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <EmptyState
            icon="📋"
            title="No items found"
            description="There are no items to display at this time."
            type="info"
          />
          <EmptyState
            icon="✅"
            title="All caught up!"
            description="You've completed all your tasks."
            type="success"
            action={<button className="btn-primary">Add New Task</button>}
          />
          <EmptyState
            icon="⚠️"
            title="Limited access"
            description="You don't have permission to view this content."
            type="warning"
          />
          <EmptyState
            icon="❌"
            title="Connection failed"
            description="Unable to load data. Please check your connection."
            type="error"
            action={<button className="btn-secondary">Retry</button>}
          />
        </div>
      </section>

      {/* Button State Tests */}
      <section>
        <h2 className="cc-heading-lg mb-4">4. Button States</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Active</button>
            <button className="btn-primary" disabled>Primary Disabled</button>
            <button className="btn-secondary">Secondary Active</button>
            <button className="btn-secondary" disabled>Secondary Disabled</button>
          </div>
          <div className="flex justify-center">
            <button className="btn-record btn-record-breathe h-32 w-32 flex items-center justify-center">
              <span className="text-lg">🎤</span>
            </button>
          </div>
          <div className="flex justify-center">
            <button className="btn-record h-32 w-32 flex items-center justify-center" disabled>
              <span className="text-lg">🎤</span>
            </button>
          </div>
        </div>
      </section>

      {/* Admin Table Test */}
      <section>
        <h2 className="cc-heading-lg mb-4">5. Admin Table Interactions</h2>
        <div className="card">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td>
                    <div className="font-bold">Client {i}</div>
                    <div className="text-xs text-gray-500">ID: {i}00</div>
                  </td>
                  <td>
                    <span className="badge badge-success">ACTIVE</span>
                  </td>
                  <td className="font-bold">${i * 25}.00</td>
                  <td>
                    <button className="text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reduced Motion Test */}
      <section>
        <h2 className="cc-heading-lg mb-4">6. Reduced Motion Check</h2>
        <div className="card">
          <p className="cc-body mb-4">
            To test reduced-motion support:
          </p>
          <ol className="list-decimal list-inside space-y-2 cc-body text-gray-700">
            <li>Open DevTools (F12)</li>
            <li>Press Ctrl+Shift+P (Cmd+Shift+P on Mac)</li>
            <li>Type "Emulate CSS prefers-reduced-motion"</li>
            <li>Select "reduced"</li>
            <li>Observe all animations stop (including breathing button above)</li>
          </ol>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="animate-fade-in">
              <p className="font-semibold text-blue-900">Test Animation</p>
              <p className="text-sm text-blue-700">This should fade in on load, but not animate with reduced-motion enabled.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

## Manual Testing Checklist

### Desktop Tests (1920×1080)

**Home Page:**
- [ ] Red button breathes smoothly (3s cycle)
- [ ] Halo visible behind button
- [ ] Service cards lift on hover
- [ ] Trust banner displays correctly
- [ ] Support banner at top

**Recording Page:**
- [ ] Two-column layout renders
- [ ] Recording ring appears when active
- [ ] Tips panel visible on right
- [ ] Success card animates on completion
- [ ] Step progress shows icon for step 1

**Admin Pages:**
- [ ] Sidebar navigation active state works
- [ ] Table rows hover with left accent bar
- [ ] Stats cards lift on hover
- [ ] Badges display with correct colors
- [ ] Clicking table cells works (not blocked)

### Mobile Tests (375×667)

**Home Page:**
- [ ] Red button centered and sized appropriately
- [ ] Service cards stack vertically
- [ ] Text readable without zooming

**Recording Page:**
- [ ] Single column layout
- [ ] Tips panel below recording controls
- [ ] Step progress shows simplified bar

**Admin Pages:**
- [ ] Sidebar collapses (if implemented)
- [ ] Table scrolls horizontally
- [ ] Cards stack properly

### Tablet Tests (768×1024)

**All Pages:**
- [ ] Breakpoint transitions smoothly from mobile
- [ ] Two-column layouts activate at md: breakpoint
- [ ] Touch targets 44×44px minimum

### Accessibility Tests

**Keyboard Navigation:**
- [ ] Tab order logical
- [ ] Focus rings visible (4px blue)
- [ ] Enter/Space activate buttons
- [ ] Escape dismisses banners

**Screen Reader:**
- [ ] Banners announce with role="alert"
- [ ] Loading states announce with aria-live
- [ ] Empty states have role="status"
- [ ] Step progress has aria-current="step"

**Reduced Motion:**
- [ ] Enable in DevTools
- [ ] Breathing button stops
- [ ] Recording ring static
- [ ] Skeleton pulse stops
- [ ] Page animations removed
- [ ] Hover transforms disabled

### Browser Tests

**Chrome/Edge (Chromium):**
- [ ] All features work
- [ ] Backdrop blur renders
- [ ] text-wrap: balance applies (114+)

**Firefox:**
- [ ] All features work
- [ ] Vendor prefixes correct
- [ ] Animations smooth

**Safari:**
- [ ] All features work
- [ ] Webkit prefixes applied
- [ ] iOS touch targets adequate

### Performance Tests

**Animation Frame Rate:**
- [ ] 60fps maintained during animations
- [ ] No jank on button hover
- [ ] Smooth scrolling

**Load Time:**
- [ ] CSS loads <100ms
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] Fonts load progressively

## Expected Results

### Visual Consistency ✓
- All buttons same padding (16px 32px)
- All cards same border-radius (12px)
- All shadows use design system scale
- All spacing uses 4-64px scale

### Animation Timing ✓
- Fast: 150ms (table interactions)
- Normal: 250ms (button hover, scale-in)
- Slow: 350ms (page elements, slides)
- Breathing: 3s (calm idle)
- Recording: 2s (active attention)

### Color Consistency ✓
- Primary: #1B3A5D (government blue)
- Accent: #C1121F (action red)
- Success: #059669 (green)
- Warning: #D97706 (amber)
- Error: #DC2626 (red)
- Info: #2563EB (blue)

## Common Issues & Fixes

### Issue: Skeleton not animating
**Cause:** Browser doesn't support animation  
**Fix:** Check for reduced-motion setting

### Issue: Table rows not clickable
**Cause:** Transform blocking pointer events  
**Fix:** Already fixed with z-index: 1 on td elements

### Issue: Button disabled state not showing
**Cause:** :disabled selector needs button type="button"  
**Fix:** Add type attribute to buttons

### Issue: Empty state too wide on mobile
**Cause:** max-width 400px on description  
**Fix:** Already responsive with max-width constraint

### Issue: Banner not dismissing
**Cause:** Missing onDismiss handler  
**Fix:** Add state management for banner visibility

## Screenshot Locations

After testing, save screenshots to:
```
v1-frontend/screenshots/phase-1.8/
├── home-desktop.png
├── home-mobile.png
├── recording-desktop.png
├── recording-mobile.png
├── admin-table-hover.png
├── banners-all-types.png
├── empty-states-grid.png
├── loading-skeletons.png
├── buttons-all-states.png
└── reduced-motion-active.png
```

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Browser:** _______________  
**Device:** _______________  
**All Tests Pass:** [ ] Yes [ ] No  
**Notes:** _____________________________________
