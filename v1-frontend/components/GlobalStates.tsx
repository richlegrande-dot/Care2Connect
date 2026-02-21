/**
 * Global State Components
 * Reusable UI components for loading, empty states, and banners
 * Part of CareConnect Design System v2.0
 */

import React from 'react'

/* ========================================
   Loading Skeletons
   ======================================== */

export function SkeletonText({ large = false, small = false, width = '100%' }: { 
  large?: boolean; 
  small?: boolean; 
  width?: string 
}) {
  const sizeClass = large ? 'large' : small ? 'small' : ''
  const widthClass = width === '100%' ? 'w-full' : width === '80%' ? 'w-4/5' : width === '60%' ? 'w-3/5' : ''
  
  return (
    <div 
      className={`skeleton skeleton-text ${sizeClass} ${widthClass || ''}`}
      style={!widthClass && width !== '100%' ? { width } : undefined}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="skeleton-card" aria-busy="true" aria-live="polite">
      {children || (
        <>
          <SkeletonText large width="60%" />
          <SkeletonText width="100%" />
          <SkeletonText width="80%" />
        </>
      )}
    </div>
  )
}

export function SkeletonTable({ rows = 3, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="card" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SkeletonText key={colIdx} width="100%" />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ========================================
   Empty States
   ======================================== */

export type EmptyStateType = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  type?: EmptyStateType
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, type = 'default', action }: EmptyStateProps) {
  const typeClass = type !== 'default' ? type : ''
  
  return (
    <div className={`empty-state ${typeClass}`} role="status" aria-live="polite">
      <div className="empty-state-icon">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

/* ========================================
   Banner Components
   ======================================== */

export type BannerType = 'success' | 'error' | 'warning' | 'info'

export interface BannerProps {
  type: BannerType
  title?: string
  message: string
  icon?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const defaultIcons: Record<BannerType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

export function Banner({ 
  type, 
  title, 
  message, 
  icon, 
  dismissible = false, 
  onDismiss 
}: BannerProps) {
  const displayIcon = icon || defaultIcons[type]
  
  return (
    <div className={`banner ${type}`} role="alert">
      <div className="banner-icon" aria-hidden="true">
        {displayIcon}
      </div>
      <div className="banner-content">
        {title && <div className="banner-title">{title}</div>}
        <div className="banner-message">{message}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}

/* ========================================
   Usage Examples
   ======================================== */

/**
 * Example: Loading Skeleton
 * 
 * <SkeletonCard />
 * <SkeletonTable rows={5} columns={6} />
 * <SkeletonText large width="40%" />
 */

/**
 * Example: Empty State
 * 
 * <EmptyState
 *   icon="📋"
 *   title="No donations yet"
 *   description="When people contribute to your cause, their donations will appear here."
 *   type="info"
 *   action={<button className="btn-primary">Learn More</button>}
 * />
 */

/**
 * Example: Banners
 * 
 * <Banner
 *   type="success"
 *   title="Upload Complete"
 *   message="Your recording has been saved successfully."
 *   dismissible
 *   onDismiss={() => console.log('dismissed')}
 * />
 * 
 * <Banner
 *   type="error"
 *   message="Unable to process payment. Please check your card details."
 * />
 */
