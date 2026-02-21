import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useProfile,
  useCreateProfile,
  useUpdateProfile,
} from "../hooks/useProfile";

// Mock the API client
jest.mock("../lib/api-client", () => ({
  api: {
    profile: {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { api } from "../lib/api-client";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProfile hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useProfile", () => {
    it("fetches profile data successfully", async () => {
      const mockProfile = {
        id: "profile-123",
        name: "John Doe",
        bio: "Construction worker",
        skills: ["construction", "painting"],
        viewCount: 10,
        user: {
          location: "San Francisco, CA",
        },
      };

      (api.profile.get as jest.Mock).mockResolvedValue({ data: mockProfile });

      const { result } = renderHook(() => useProfile("profile-123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ data: mockProfile });
      expect(api.profile.get).toHaveBeenCalledWith("profile-123");
    });

    it("handles profile fetch error", async () => {
      const mockError = new Error("Profile not found");
      (api.profile.get as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useProfile("nonexistent-profile"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it("does not fetch when profileId is not provided", () => {
      renderHook(() => useProfile(""), {
        wrapper: createWrapper(),
      });

      expect(api.profile.get).not.toHaveBeenCalled();
    });
  });

  describe("useCreateProfile", () => {
    it("creates profile successfully", async () => {
      const mockCreatedProfile = {
        id: "profile-123",
        name: "John Doe",
        bio: "Construction worker",
      };

      (api.profile.create as jest.Mock).mockResolvedValue(mockCreatedProfile);

      const { result } = renderHook(() => useCreateProfile(), {
        wrapper: createWrapper(),
      });

      const createData = {
        userId: "user-123",
        transcript: "Hi, my name is John...",
        profileData: {
          name: "John Doe",
          skills: ["construction"],
        },
        consentGiven: true,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(mockCreatedProfile);
      expect(api.profile.create).toHaveBeenCalledWith(createData);
    });

    it("handles profile creation error", async () => {
      const mockError = new Error("Validation failed");
      (api.profile.create as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateProfile(), {
        wrapper: createWrapper(),
      });

      const createData = {
        userId: "user-123",
        transcript: "Hi...",
        profileData: {},
        consentGiven: false,
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe("useUpdateProfile", () => {
    it("updates profile successfully", async () => {
      const mockUpdatedProfile = {
        id: "profile-123",
        name: "John Doe",
        bio: "Updated bio",
        skills: ["construction", "painting"],
      };

      (api.profile.update as jest.Mock).mockResolvedValue(mockUpdatedProfile);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        profileId: "profile-123",
        userId: "user-123",
        data: {
          bio: "Updated bio",
          skills: ["construction", "painting"],
        },
      };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(mockUpdatedProfile);
      expect(api.profile.update).toHaveBeenCalledWith(
        "profile-123",
        updateData.data,
        "user-123",
      );
    });

    it("handles profile update error", async () => {
      const mockError = new Error("Not authorized");
      (api.profile.update as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        profileId: "profile-123",
        userId: "different-user",
        data: { bio: "Updated bio" },
      };

      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });
  });
});
