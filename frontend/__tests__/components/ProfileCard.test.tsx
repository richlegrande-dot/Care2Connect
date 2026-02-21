import { render, screen } from '@testing-library/react'
import { ProfileCard } from '../features/profile/ProfileCard'

const mockProfile = {
  id: 'profile-123',
  name: 'John Doe',
  bio: 'Experienced construction worker looking for stable employment opportunities.',
  skills: ['construction', 'painting', 'carpentry'],
  urgentNeeds: ['housing', 'employment'],
  longTermGoals: ['stable housing', 'full-time job'],
  donationPitch: 'Help John get back on his feet with stable housing and work opportunities.',
  cashtag: '$johndoe123',
  qrCodeUrl: '/qr-codes/cashapp-johndoe123.png',
  viewCount: 25,
  isProfilePublic: true,
  createdAt: '2024-01-15T10:30:00Z',
  user: {
    location: 'San Francisco, CA',
    memberSince: '2024-01-15T10:30:00Z'
  }
}

describe('ProfileCard', () => {
  it('renders profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Experienced construction worker looking for stable employment opportunities.')).toBeInTheDocument()
    expect(screen.getByText('construction')).toBeInTheDocument()
    expect(screen.getByText('painting')).toBeInTheDocument()
    expect(screen.getByText('carpentry')).toBeInTheDocument()
    expect(screen.getByText('25 views')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('displays urgent needs section', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('Immediate Needs')).toBeInTheDocument()
    expect(screen.getByText('housing')).toBeInTheDocument()
    expect(screen.getByText('employment')).toBeInTheDocument()
  })

  it('displays long-term goals section', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('stable housing')).toBeInTheDocument()
    expect(screen.getByText('full-time job')).toBeInTheDocument()
  })

  it('displays donation information when available', () => {
    render(<ProfileCard profile={mockProfile} />)

    expect(screen.getByText('Help John get back on his feet with stable housing and work opportunities.')).toBeInTheDocument()
    expect(screen.getByText('$johndoe123')).toBeInTheDocument()
  })

  it('shows QR code when available', () => {
    render(<ProfileCard profile={mockProfile} />)

    const qrCodeImage = screen.getByAltText('Cash App QR Code')
    expect(qrCodeImage).toBeInTheDocument()
    expect(qrCodeImage).toHaveAttribute('src', '/qr-codes/cashapp-johndoe123.png')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalProfile = {
      id: 'profile-456',
      name: 'Jane Smith',
      bio: 'Looking for opportunities',
      skills: ['customer service'],
      urgentNeeds: ['housing'],
      longTermGoals: ['stable job'],
      donationPitch: null,
      cashtag: null,
      qrCodeUrl: null,
      viewCount: 5,
      isProfilePublic: true,
      createdAt: '2024-01-15T10:30:00Z',
      user: {
        location: null,
        memberSince: '2024-01-15T10:30:00Z'
      }
    }

    render(<ProfileCard profile={minimalProfile} />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Looking for opportunities')).toBeInTheDocument()
    expect(screen.getByText('customer service')).toBeInTheDocument()
    expect(screen.getByText('5 views')).toBeInTheDocument()
    
    // Should not show donation section when no cashtag or donation pitch
    expect(screen.queryByText('Support')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Cash App QR Code')).not.toBeInTheDocument()
  })

  it('displays formatted creation date', () => {
    render(<ProfileCard profile={mockProfile} />)

    // Should show some form of formatted date
    expect(screen.getByText(/Member since/)).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<ProfileCard profile={mockProfile} />)

    // Check for main container classes
    const profileCard = container.firstChild
    expect(profileCard).toHaveClass('bg-white', 'shadow-lg', 'rounded-lg')
  })

  it('handles long bio text with proper truncation', () => {
    const longBioProfile = {
      ...mockProfile,
      bio: 'This is a very long bio that should be truncated or handled properly in the UI. '.repeat(10)
    }

    render(<ProfileCard profile={longBioProfile} />)

    const bioElement = screen.getByText(/This is a very long bio that should be truncated or handled properly in the UI\./)
    expect(bioElement).toBeInTheDocument()
    expect(bioElement).toHaveClass('line-clamp-3') // Assuming Tailwind line-clamp is used
  })

  it('displays skill tags with proper formatting', () => {
    render(<ProfileCard profile={mockProfile} />)

    const skillElements = screen.getAllByTestId(/skill-tag/)
    expect(skillElements).toHaveLength(3)
    
    skillElements.forEach(element => {
      expect(element).toHaveClass('bg-blue-100', 'text-blue-800', 'px-2', 'py-1', 'rounded-full', 'text-sm')
    })
  })

  it('shows view count with proper formatting', () => {
    render(<ProfileCard profile={mockProfile} />)

    const viewCount = screen.getByText('25 views')
    expect(viewCount).toBeInTheDocument()
    expect(viewCount).toHaveClass('text-gray-500', 'text-sm')
  })
})