import { yupResolver } from '@hookform/resolvers/yup';
import { createAlertDefinitionSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { Drawer } from 'src/components/Drawer';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import {
  useCreateAlertDefinition,
  useNotificationChannels,
} from 'src/queries/cloudpulse/alerts';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';

import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { TriggerConditions } from './Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { EngineOption } from './GeneralInformation/EngineOption';
import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';
import { AddNotificationChannel } from './NotificationChannel/AddNotificationChannel';

import type {
  CreateAlertDefinitionPayload,
  MetricCriteria,
  NotificationChannel,
  TriggerCondition,
} from '@linode/api-v4/lib/cloudpulse/types';
import { AddChannelListing } from './NotificationChannel/AddChannelListing';

const triggerConditionInitialValues: TriggerCondition = {
  criteria_condition: '',
  evaluation_period_seconds: '',
  polling_interval_seconds: '',
  trigger_occurrences: 0,
};
const criteriaInitialValues: MetricCriteria[] = [
  {
    aggregation_type: '',
    dimension_filters: [],
    metric: '',
    operator: '',
    value: 0,
  },
];
export const initialValues: CreateAlertDefinitionPayload = {
  channel_ids: [],
  criteria: criteriaInitialValues,
  engineOption: '',
  name: '',
  region: '',
  resource_ids: [],
  service_type: '',
  severity: '',
  triggerCondition: triggerConditionInitialValues,
};

export interface ErrorUtilsProps {
  errors: string | string[] | undefined;
  touched: boolean | undefined;
}
export const ErrorMessage = ({ errors, touched }: ErrorUtilsProps) => {
  if (touched && errors) {
    return <Box sx={(theme) => ({ color: theme.color.red })}>{errors}</Box>;
  } else {
    return null;
  }
};

export const CreateAlertDefinition = React.memo(() => {
  const {
    data: engineOptions,
    isError: engineOptionError,
    isLoading: engineOptionLoading,
  } = useDatabaseEnginesQuery(true);

  const {
    data: notificationChannels,
    isError: notificationChannelError,
    isLoading: notificationChannelLoading,
  } = useNotificationChannels();
  // eslint-disable-next-line no-console
  console.log(notificationChannels);
  const history = useHistory();
  const alertCreateExit = () => {
    const pathParts = location.pathname.split('/');
    pathParts.pop();
    const previousPage = pathParts.join('/');
    history.push(previousPage);
  };

  const formMethods = useForm<CreateAlertDefinitionPayload>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: yupResolver(createAlertDefinitionSchema),
  });

  const [openAddNotification, setOpenAddNotification] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    NotificationChannel[]
  >([]);
  const {
    control,
    formState,
    handleSubmit,
    setError,
    watch,
    setValue,
  } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition();

  const onChangeNotifications = (notifications: NotificationChannel[]) => {
    setNotifications(notifications);
    const notificationTemplateList = notifications.map(
      (notification) => notification.id
    );
    setValue('channel_ids', notificationTemplateList);
  };

  const onSubmitAddNotification = (notification: NotificationChannel) => {
    const newNotifications = [...notifications, notification];
    const notificationTemplateList = newNotifications.map(
      (notification) => notification.id
    );
    setValue('channel_ids', notificationTemplateList);
    setNotifications(newNotifications);
    setOpenAddNotification(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAlert(values);
      enqueueSnackbar('Alert successfully created', {
        variant: 'success',
      });
      alertCreateExit();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });
  const [maxScrapeInterval, setMaxScrapeInterval] = React.useState<number>(0);

  const generateCrumbOverrides = (pathname: string) => {
    const pathParts = pathname.split('/').filter(Boolean);
    const lastTwoParts = pathParts.slice(-2);
    const fullPaths: string[] = [];

    pathParts.forEach((_, index) => {
      fullPaths.push('/' + pathParts.slice(0, index + 1).join('/'));
    });

    const overrides = lastTwoParts.map((part, index) => ({
      label: part,
      linkTo: fullPaths[pathParts.length - 2 + index],
      position: index + 1,
    }));

    return { newPathname: '/' + lastTwoParts.join('/'), overrides };
  };

  const { newPathname, overrides } = React.useMemo(
    () => generateCrumbOverrides(location.pathname),
    []
  );

  const engineOptionValue = watch('service_type');
  return (
    <Paper>
      <Breadcrumb
        crumbOverrides={overrides}
        pathname={newPathname}
      ></Breadcrumb>
      <FormProvider {...formMethods}>
        <form onSubmit={onSubmit}>
          <Typography variant="h2">1. General Information</Typography>
          <Controller
            render={({ field, fieldState }) => (
              <>
                <TextField
                  label="Name"
                  name={'name'}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value ?? ''}
                />
                <ErrorMessage
                  errors={fieldState.error?.message}
                  touched={fieldState.isTouched}
                />
              </>
            )}
            control={control}
            name="name"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <TextField
                  errorText={fieldState.error?.message}
                  label="Description"
                  name={'description'}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  optional
                  value={field.value ?? ''}
                />
                <ErrorMessage
                  errors={fieldState.error?.message}
                  touched={fieldState.isTouched}
                />
              </>
            )}
            control={control}
            name="description"
          />
          <CloudPulseServiceSelect name="service_type" />
          {engineOptionValue === 'dbaas' && (
            <EngineOption
              engineOptions={engineOptions ?? []}
              isError={!!engineOptionError}
              isLoading={engineOptionLoading}
              name={'engineOption'}
            />
          )}
          <CloudPulseRegionSelect name="region" />
          <CloudPulseMultiResourceSelect
            engine={engineOptionValue}
            name="resource_ids"
            region={watch('region')}
            serviceType={watch('service_type')}
          />
          <CloudPulseAlertSeveritySelect name="severity" />
          <MetricCriteriaField
            getMaxInterval={(interval: number) =>
              setMaxScrapeInterval(interval)
            }
            name="criteria"
            serviceType={watch('service_type')}
          />
          <TriggerConditions
            maxScrapingInterval={maxScrapeInterval}
            name={'triggerCondition'}
          />
          <AddChannelListing
            notifications={notificationChannels?.data ?? []}
            onChangeNotifications={onChangeNotifications}
            onClickAddNotification={() => setOpenAddNotification(true)}
          />
          <ActionsPanel
            primaryButtonProps={{
              label: 'Submit',
              loading: formState.isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: alertCreateExit,
            }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          />
        </form>
      </FormProvider>
      {openAddNotification && (
        <Drawer
          onClose={() => setOpenAddNotification(false)}
          open={openAddNotification}
          title="Add Notification Channel"
        >
          <AddNotificationChannel
            onCancel={() => setOpenAddNotification(false)}
            onClickAddNotification={onSubmitAddNotification}
            templateData={notificationChannels?.data ?? []}
          />
        </Drawer>
      )}
    </Paper>
  );
}); 
