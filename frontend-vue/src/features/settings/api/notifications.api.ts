import {
  getApiV1Notifications,
  putApiV1NotificationsByIdRead,
  putApiV1NotificationsReadAll,
} from '@/lib/generated'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export interface GetNotificationsParams {
  limit?: number
}

// --- Query keys ---
export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (params?: GetNotificationsParams) => ['notifications', 'list', params ?? {}] as const,
}

// --- Fungsi API murni ---
export async function getNotificationsApi(params?: GetNotificationsParams, signal?: AbortSignal) {
  const { data } = await getApiV1Notifications({
    query: { Limit: params?.limit },
    signal,
    throwOnError: true,
  })
  return data
}

export async function markNotificationReadApi({ id }: { id: string }) {
  const { data } = await putApiV1NotificationsByIdRead({
    path: { id },
    throwOnError: true,
  })
  return data
}

export async function markAllNotificationsReadApi() {
  const { data } = await putApiV1NotificationsReadAll({
    throwOnError: true,
  })
  return data
}

// --- Composables ---
export function useGetNotificationsQuery(
  params?: MaybeRefOrGetter<GetNotificationsParams | undefined>,
) {
  return useQuery({
    queryKey: computed(() => notificationsKeys.list(toValue(params))),
    queryFn: ({ signal }) => getNotificationsApi(toValue(params), signal),
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
  })
}
