import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AudioRecorder } from '../features/audio/AudioRecorder'

// Mock MediaRecorder
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
}

beforeEach(() => {
  global.MediaRecorder = jest.fn(() => mockMediaRecorder) as any
  navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  } as any
})

describe('AudioRecorder', () => {
  const mockOnRecordingComplete = jest.fn()
  const mockOnRecordingStart = jest.fn()
  const mockOnRecordingStop = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders start recording button initially', () => {
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onRecordingStart={mockOnRecordingStart}
        onRecordingStop={mockOnRecordingStop}
      />
    )

    expect(screen.getByText('Start Recording')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('starts recording when start button is clicked', async () => {
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onRecordingStart={mockOnRecordingStart}
        onRecordingStop={mockOnRecordingStop}
      />
    )

    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
      expect(mockOnRecordingStart).toHaveBeenCalled()
    })
  })

  it('shows stop button and timer when recording', async () => {
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onRecordingStart={mockOnRecordingStart}
        onRecordingStop={mockOnRecordingStop}
      />
    )

    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument()
      expect(screen.getByText(/Recording/)).toBeInTheDocument()
    })
  })

  it('stops recording when stop button is clicked', async () => {
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onRecordingStart={mockOnRecordingStart}
        onRecordingStop={mockOnRecordingStop}
      />
    )

    // Start recording
    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument()
    })

    // Stop recording
    const stopButton = screen.getByText('Stop Recording')
    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(mockMediaRecorder.stop).toHaveBeenCalled()
      expect(mockOnRecordingStop).toHaveBeenCalled()
    })
  })

  it('handles recording completion', async () => {
    const mockBlob = new Blob(['audio data'], { type: 'audio/wav' })
    
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onRecordingStart={mockOnRecordingStart}
        onRecordingStop={mockOnRecordingStop}
      />
    )

    // Start recording
    fireEvent.click(screen.getByText('Start Recording'))

    await waitFor(() => {
      expect(mockMediaRecorder.addEventListener).toHaveBeenCalledWith('dataavailable', expect.any(Function))
    })

    // Simulate data available event
    const dataAvailableCallback = mockMediaRecorder.addEventListener.mock.calls
      .find(call => call[0] === 'dataavailable')[1]
    
    dataAvailableCallback({ data: mockBlob })

    expect(mockOnRecordingComplete).toHaveBeenCalledWith(mockBlob)
  })

  it('respects maxDuration prop', () => {
    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        maxDuration={300}
      />
    )

    expect(screen.getByText(/Max: 5:00/)).toBeInTheDocument()
  })

  it('handles microphone permission errors', async () => {
    const mockError = new Error('Permission denied')
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(mockError)

    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
      />
    )

    fireEvent.click(screen.getByText('Start Recording'))

    await waitFor(() => {
      expect(screen.getByText(/Error accessing microphone/)).toBeInTheDocument()
    })
  })

  it('shows recording duration timer', async () => {
    jest.useFakeTimers()

    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
      />
    )

    fireEvent.click(screen.getByText('Start Recording'))

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument()
    })

    // Advance timer by 5 seconds
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.getByText(/0:05/)).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('automatically stops recording at max duration', async () => {
    jest.useFakeTimers()

    render(
      <AudioRecorder
        onRecordingComplete={mockOnRecordingComplete}
        maxDuration={10}
      />
    )

    fireEvent.click(screen.getByText('Start Recording'))

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument()
    })

    // Advance timer past max duration
    jest.advanceTimersByTime(11000)

    await waitFor(() => {
      expect(mockMediaRecorder.stop).toHaveBeenCalled()
    })

    jest.useRealTimers()
  })
})