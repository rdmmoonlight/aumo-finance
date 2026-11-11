import { authKeys } from '@/features/auth/auth.api'
import {
  deleteApiV1SettingsDeleteAccount,
  postApiV1SettingsAvatar,
  postApiV1SettingsChangePassword,
  postApiV1SettingsRevokeAllSessions,
  postApiV1SettingsRevokeSessionBySessionId,
  putApiV1SettingsProfile,
} from '@/lib/generated'
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/lib/generated/types.gen'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export type { ChangePasswordRequest, UpdateProfileRequest }

export interface RevokeSessionArg {
  sessionId: string
}

// --- Query keys ---
export const settingsKeys = {
  all: ['settings'] as const,
}

// --- Fungsi API murni ---
export async function updateProfileApi(body: UpdateProfileRequest) {
  const { data } = await putApiV1SettingsProfile({
    body,
    throwOnError: true,
  })
  return data
}

export async function uploadAvatarApi(formData: FormData) {
  const { data } = await postApiV1SettingsAvatar({
    body: formData as unknown as Parameters<typeof postApiV1SettingsAvatar>[0]['body'],
    bodySerializer: null,
    headers: { 'Content-Type': null },
    throwOnError: true,
  })
  return data
}

export async function changePasswordApi(body: ChangePasswordRequest) {
  const { data } = await postApiV1SettingsChangePassword({
    body,
    throwOnError: true,
  })
  return data
}

export async function deleteAccountApi() {
  const { data } = await deleteApiV1SettingsDeleteAccount({
    throwOnError: true,
  })
  return data
}

export async function revokeSessionByIdApi({ sessionId }: RevokeSessionArg) {
  const { data } = await postApiV1SettingsRevokeSessionBySessionId({
    path: { sessionId },
    throwOnError: true,
  })
  return data
}

export async function revokeAllSessionsApi() {
  const { data } = await postApiV1SettingsRevokeAllSessions({
    throwOnError: true,
  })
  return data
}

// --- Composables ---
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadAvatarApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
  })
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useRevokeSessionByIdMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeSessionByIdApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

export function useRevokeAllSessionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: revokeAllSessionsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}
