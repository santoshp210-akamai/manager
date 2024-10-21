import { createAlertDefinition } from '@linode/api-v4/lib/cloudpulse';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryFactory } from './queries';

import type {
  Alert,
  CreateAlertDefinitionPayload,
  NotificationChannelList,
} from '@linode/api-v4/lib/cloudpulse';
import type { APIError } from '@linode/api-v4/lib/types';

export const aclpQueryKey = 'aclp-alerts';

export const useCreateAlertDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation<Alert, APIError[], CreateAlertDefinitionPayload>({
    mutationFn: (data) => createAlertDefinition(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [aclpQueryKey] });
    },
  });
};

export const useNotificationChannels = () => {
  return useQuery<NotificationChannelList, APIError[]>({
    ...queryFactory.notificationChannels,
  });
};
