import { APIClient } from '../api-client'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('APIClient', () => {
  let apiClient: APIClient

  beforeEach(() => {
    apiClient = new APIClient('http://localhost:3001/api')
    jest.clearAllMocks()
  })

  describe('profile methods', () => {
    it('gets profile successfully', async () => {
      const mockProfile = {
        success: true,
        data: {
          id: 'profile-123',
          name: 'John Doe',
          bio: 'Construction worker',
          skills: ['construction', 'painting']
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      })

      const result = await apiClient.profile.get('profile-123')

      expect(result).toEqual(mockProfile)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile/profile-123',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('creates profile successfully', async () => {
      const mockCreatedProfile = {
        success: true,
        data: {
          id: 'profile-123',
          name: 'John Doe',
          bio: 'Construction worker'
        }
      }

      const createData = {
        userId: 'user-123',
        transcript: 'Hi, my name is John...',
        profileData: {
          name: 'John Doe',
          skills: ['construction']
        },
        consentGiven: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedProfile,
      })

      const result = await apiClient.profile.create(createData)

      expect(result).toEqual(mockCreatedProfile)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        }
      )
    })

    it('updates profile successfully', async () => {
      const mockUpdatedProfile = {
        success: true,
        data: {
          id: 'profile-123',
          name: 'John Doe',
          bio: 'Updated bio'
        }
      }

      const updateData = {
        bio: 'Updated bio',
        skills: ['construction', 'painting']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedProfile,
      })

      const result = await apiClient.profile.update('profile-123', updateData, 'user-123')

      expect(result).toEqual(mockUpdatedProfile)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile/profile-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'user-123',
          },
          body: JSON.stringify(updateData),
        }
      )
    })

    it('searches profiles successfully', async () => {
      const mockSearchResults = {
        success: true,
        data: {
          profiles: [
            {
              id: 'profile-1',
              name: 'John Doe',
              bio: 'Construction worker'
            }
          ],
          totalCount: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      })

      const result = await apiClient.profile.search({
        query: 'construction',
        location: 'san francisco',
        page: 1,
        limit: 10
      })

      expect(result).toEqual(mockSearchResults)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile?query=construction&location=san%20francisco&page=1&limit=10',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })

  describe('transcription methods', () => {
    it('uploads and transcribes audio successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          transcript: 'Hi, my name is John...',
          profileData: {
            name: 'John',
            skills: ['construction']
          }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      const formData = new FormData()
      formData.append('audio', mockFile)
      formData.append('userId', 'user-123')

      const result = await apiClient.transcription.upload(formData)

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transcribe',
        {
          method: 'POST',
          body: formData,
        }
      )
    })

    it('gets transcription status successfully', async () => {
      const mockStatus = {
        success: true,
        data: {
          status: 'completed',
          audioFileId: 'audio-123'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      })

      const result = await apiClient.transcription.getStatus('audio-123')

      expect(result).toEqual(mockStatus)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/transcribe/audio-123/status',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    })
  })

  describe('error handling', () => {
    it('throws error for non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Profile not found' }),
      })

      await expect(apiClient.profile.get('nonexistent-profile')).rejects.toThrow('API Error: Not Found')
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.profile.get('profile-123')).rejects.toThrow('Network error')
    })

    it('includes error response body in error message', async () => {
      const errorResponse = { error: 'Validation failed', details: 'Name is required' }
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorResponse,
      })

      try {
        await apiClient.profile.create({} as any)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toContain('Bad Request')
      }
    })
  })

  describe('request headers', () => {
    it('includes default headers for JSON requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiClient.profile.get('profile-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('includes custom headers when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await apiClient.profile.update('profile-123', {}, 'user-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-user-id': 'user-123',
          }),
        })
      )
    })

    it('omits Content-Type header for FormData requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const formData = new FormData()
      await apiClient.transcription.upload(formData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      )

      // Should not include Content-Type header for FormData
      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs.headers).toBeUndefined()
    })
  })
})