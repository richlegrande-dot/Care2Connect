import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import HomePage from '../app/page'

// Mock the useRouter hook
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the API hooks
jest.mock('../hooks/useProfile', () => ({
  useCreateProfile: () => ({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading and description', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('CareConnect')).toBeInTheDocument()
    expect(screen.getByText(/Share your story, find support, discover opportunities/)).toBeInTheDocument()
  })

  it('shows the audio recording section', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/Record Your Story/)).toBeInTheDocument()
    expect(screen.getByText(/Tell us about yourself/)).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Job Search')).toBeInTheDocument()
    expect(screen.getByText('Resource Finder')).toBeInTheDocument()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Support Platform')).toBeInTheDocument()
  })

  it('shows browse profiles section', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/Browse Profiles/)).toBeInTheDocument()
    const browseButton = screen.getByText('View All Profiles')
    expect(browseButton).toBeInTheDocument()
  })

  it('navigates to profiles page when browse button is clicked', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    const browseButton = screen.getByText('View All Profiles')
    fireEvent.click(browseButton)

    expect(mockPush).toHaveBeenCalledWith('/profiles')
  })

  it('shows getting started section', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/How It Works/)).toBeInTheDocument()
    expect(screen.getByText(/Record your story/)).toBeInTheDocument()
    expect(screen.getByText(/AI creates your profile/)).toBeInTheDocument()
    expect(screen.getByText(/Connect with opportunities/)).toBeInTheDocument()
  })

  it('displays anonymous mode information', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/Your privacy matters/)).toBeInTheDocument()
    expect(screen.getByText(/anonymous/i)).toBeInTheDocument()
  })

  it('shows call-to-action buttons', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    const getStartedButton = screen.getByText('Get Started')
    const learnMoreButton = screen.getByText('Learn More')

    expect(getStartedButton).toBeInTheDocument()
    expect(learnMoreButton).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()

    // Check for proper button roles
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    buttons.forEach(button => {
      expect(button).toBeVisible()
    })
  })

  it('is responsive and mobile-friendly', () => {
    const { container } = render(
      <div>
        <HomePage />
      </div>,
      { wrapper: createWrapper() }
    )

    // Check for responsive classes (assuming Tailwind CSS)
    const responsiveElements = container.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="sm:"]')
    expect(responsiveElements.length).toBeGreaterThan(0)
  })
})