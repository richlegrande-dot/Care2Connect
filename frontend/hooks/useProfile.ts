import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export function useProfile(profileId?: string) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => api.profile.get(profileId as string),
    enabled: !!profileId,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.profile.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { profileId: string; userId?: string; data: any }) =>
      api.profile.update(vars.profileId, vars.data, vars.userId),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["profile", vars.profileId] }),
  });
}
