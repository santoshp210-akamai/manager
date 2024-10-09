import { Grid } from '@mui/material';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import {
  EvaluationPeriodOptions,
  PollingIntervalOptions,
  TriggerOptions,
} from '../../constants';
import { ControllerErrorMessage } from './Metric';
interface TriggerConditionProps {
  /**
   * maximum scraping interval value for a metric to filter the evaluation period and polling interval options
   */
  maxScrapingInterval: number;
  /**
   * name used for the component to set formik field
   */
  name: string;
}
type IntervalOptions = {
  label: '';
  value: '';
};
export const TriggerConditions = React.memo((props: TriggerConditionProps) => {
  const [
    selectedEvaluationPeriod,
    setEvaluationPeriod,
  ] = React.useState<IntervalOptions | null>(null);
  const [
    selectedPollingInterval,
    setPollingInterval,
  ] = React.useState<IntervalOptions | null>(null);

  const { maxScrapingInterval, name } = props;

  const { control, setValue } = useFormContext();
  const getPollingIntervalOptions = () => {
    return PollingIntervalOptions.filter(
      (item) => parseInt(item.value, 10) >= maxScrapingInterval
    );
  };

  const getEvaluationPeriodOptions = () => {
    return EvaluationPeriodOptions.filter(
      (item) => parseInt(item.value, 10) >= maxScrapingInterval
    );
  };
  const handleSelectChange = (field: string, value: any, operation: string) => {
    if (operation === 'selectOption') {
      setValue(`${name}.${field}`, value);
    } else {
      setValue(`${name}.${field}`, '');
    }
  };

  return (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
        borderRadius: 1,
        marginTop: theme.spacing(2),
        p: 2,
      })}
    >
      <Typography variant="h3"> Trigger Conditions</Typography>
      <Grid alignItems="center" container spacing={2}>
        <Grid item md={3} sm={6} xs={12}>
          <Controller
            render={({ field }) => (
              <Autocomplete
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_, value: IntervalOptions, operation) => {
                  handleSelectChange(
                    'evaluation_period_seconds',
                    value?.value ?? '',
                    operation
                  );
                  setEvaluationPeriod(value);
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Choose the data lookback period on which thresholds are applied',
                }}
                data-testid="Evaluation-period"
                label={'Evaluation period'}
                onBlur={field.onBlur}
                options={getEvaluationPeriodOptions()}
                value={selectedEvaluationPeriod}
              />
            )}
            control={control}
            name={`${name}.evaluation_period_seconds`}
          />
        </Grid>
        <Grid item md={'auto'} sm={6} xs={12}>
          <Controller
            render={({ field }) => (
              <Autocomplete
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(_, value: IntervalOptions, operation) => {
                  handleSelectChange(
                    'polling_interval_seconds',
                    value?.value ?? '',
                    operation
                  );
                  setPollingInterval(value);
                }}
                textFieldProps={{
                  labelTooltipText:
                    'Choose how often you intend to evaulate the alert condition',
                }}
                data-testid="Polling-interval"
                label={'Polling interval'}
                onBlur={field.onBlur}
                options={getPollingIntervalOptions()}
                value={selectedPollingInterval}
              />
            )}
            control={control}
            name={`${name}.polling_interval_seconds`}
          />
        </Grid>
        <Grid item md={'auto'} sm={12} xs={12}>
          <Grid alignItems="center" container spacing={2}>
            <Grid item md={'auto'} sm={'auto'} xs={6}>
              <Controller
                render={({ field }) => (
                  <Autocomplete
                    isOptionEqualToValue={(option, value) =>
                      option.label === value
                    }
                    onChange={(_, value, operation) => {
                      handleSelectChange(
                        'criteria_condition',
                        value?.value,
                        operation
                      );
                    }}
                    textFieldProps={{
                      labelTooltipText:
                        'AND implies alert is triggered when all the metrics criteria are met',
                    }}
                    data-testid="Trigger-alert-condition"
                    label={'Trigger alert when'}
                    onBlur={field.onBlur}
                    options={TriggerOptions}
                    value={field.value !== '' ? field.value : null}
                  />
                )}
                control={control}
                name={`${name}.criteria_condition`}
              />
            </Grid>
            <Grid item md={'auto'} sm={6} xs={12}>
              <Box marginTop={1}>
                <Typography
                  sx={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    height: { sm: '56px', xs: '70px' },
                  }}
                  variant="body1"
                >
                  criteria are met for at least
                </Typography>
              </Box>
            </Grid>
            <Grid item md={'auto'} sm={'auto'} xs={'auto'}>
              <Controller
                render={({ field }) => (
                  <TextField
                    onWheel={(event) =>
                      event.target instanceof HTMLElement && event.target.blur()
                    }
                    sx={{
                      maxWidth: '80px',
                      minWidth: '70px',
                      paddingTop: { sm: '26px', xs: 0 },
                    }}
                    data-testid={'Trigger-occurences'}
                    label={''}
                    min={0}
                    name={`${name}.trigger_occurrences`}
                    noMarginTop={false}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value)}
                    type="number"
                    value={field.value ?? 0}
                  />
                )}
                control={control}
                name={`${name}.trigger_occurrences`}
              />
            </Grid>
            <Grid item md={'auto'} sm={'auto'} xs={'auto'}>
              <Box sx={{ paddingTop: 1 }}>
                <Typography
                  sx={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    height: { sm: '56px', xs: '26px' },
                  }}
                  variant="body1"
                >
                  occurences.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box sx={(theme) => ({ marginTop: theme.spacing(2) })}>
        <ControllerErrorMessage
          component={`${name}.evaluation_period_seconds`}
          control={control}
        />
        <ControllerErrorMessage
          component={`${name}.polling_interval_seconds`}
          control={control}
        />
        <ControllerErrorMessage
          component={`${name}.criteria_condition`}
          control={control}
        />
        <ControllerErrorMessage
          component={`${name}.trigger_occurrences`}
          control={control}
        />
      </Box>
    </Box>
  );
});
