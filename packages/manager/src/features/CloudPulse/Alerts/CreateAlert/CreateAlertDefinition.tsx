import { yupResolver } from '@hookform/resolvers/yup';
import { createAlertDefinitionSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useCreateAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';

import { MetricCriteriaField } from './Criteria/MetricCriteria';
import { TriggerConditions } from './Criteria/TriggerConditions';
import { CloudPulseAlertSeveritySelect } from './GeneralInformation/AlertSeveritySelect';
import { EngineOption } from './GeneralInformation/EngineOption';
import { CloudPulseRegionSelect } from './GeneralInformation/RegionSelect';
import { CloudPulseMultiResourceSelect } from './GeneralInformation/ResourceMultiSelect';
import { CloudPulseServiceSelect } from './GeneralInformation/ServiceTypeSelect';

import type {
  CreateAlertDefinitionPayload,
  MetricCriteria,
  TriggerCondition,
} from '@linode/api-v4/lib/cloudpulse/types';

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
  criteria: criteriaInitialValues,
  engineOption: '',
  name: '',
  region: '',
  resource_ids: [],
  service_type: '',
  severity: '',
  sink_ids: [],
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

  const { control, formState, handleSubmit, setError, watch } = formMethods;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createAlert } = useCreateAlertDefinition();

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
      <form onSubmit={onSubmit}>
        <FormProvider {...formMethods}>
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
          {/* <Controller  render={({field, fieldState}) => ()} control={control} name=""/> */}

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
          {/* <ErrorMessage errors={errors['name']} touched={touched['name']} />
          <TextField
            label="Description"
            name={'description'}
            onBlur={handleBlur}
            onChange={handleChange}
            optional
            value={values.description ?? ''}
          />
          <CloudPulseServiceSelect name={'service_type'} />
          <ErrorMessage
            errors={errors['service_type']}
            touched={touched['service_type']}
          />
          {formik.values.service_type === 'dbaas' && (
            <EngineOption
              engineOptions={engineOptions ?? []}
              isError={!!engineOptionError}
              isLoading={engineOptionLoading}
              name={'engineOption'}
            />
          )}
          <CloudPulseRegionSelect name={'region'} />
          <ErrorMessage errors={errors['region']} touched={touched['region']} />
          <CloudPulseMultiResourceSelect
            cluster={values.service_type === 'dbaas'}
            name={'resource_ids'}
            region={values.region ?? ''}
            serviceType={values.service_type ?? ''}
          />
          <ErrorMessage
            errors={errors['resource_ids']}
            touched={touched['resource_ids']}
          />
          <Autocomplete
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onBlur={(event) => {
              formik.handleBlur(event);
              formik.setFieldTouched('severity', true);
            }}
            onChange={(_, value) => {
              setFieldValue('severity', value?.value);
            }}
            value={
              values?.severity
                ? {
                    label: values.severity,
                    value: values.severity,
                  }
                : null
            }
            label={'Severity'}
            options={AlertSeverityOptions}
            size="medium"
            textFieldProps={{ labelTooltipText: 'Choose the alert severity' }}
          />
          <ErrorMessage
            errors={errors['severity']}
            touched={touched['severity']}
          />
          <MetricCriteriaField
            getMaxInterval={(interval: number) =>
              setMaxScrapeInterval(interval)
            }
            name="criteria"
            serviceType={'linode'}
          />
          <TriggerConditions
            maxScrapingInterval={maxScrapeInterval}
            name={'triggerCondition'}
          /> */}
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
        </FormProvider>
      </form>
    </Paper>
  );
});
