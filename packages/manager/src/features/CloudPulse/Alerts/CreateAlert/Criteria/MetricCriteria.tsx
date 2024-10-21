import * as React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useGetCloudPulseMetricDefinitionsByServiceType } from 'src/queries/cloudpulse/services';

import { convertSeconds } from '../../constants';
import { Metric } from './Metric';

interface MetricCriteriaProps {
  /**
   * function used to pass the scrape interval value to the parent component
   * @param maxInterval number value that takes the maximum scrape interval from the list of selected metrics
   * @returns void
   */
  getMaxInterval: (maxInterval: number) => void;
  /**
   * name used for the component to set formik field
   */
  name: string;
  /**
   * serviceType used by the api to fetch the metric definitions
   */
  serviceType: string;
}

export const MetricCriteriaField = React.memo((props: MetricCriteriaProps) => {
  const { getMaxInterval, name, serviceType } = props;
  const {
    data: metricDefinitions,
    isError: isMetricDefinitionError,
    isLoading: isMetricDefinitionLoading,
  } = useGetCloudPulseMetricDefinitionsByServiceType(
    serviceType,
    serviceType !== ''
  );

  const { control, watch } = useFormContext();

  React.useEffect(() => {
    const formikMetricValues = new Set(
      watch(name).map((item: any) => item.metric)
    );

    const intervalList =
      metricDefinitions &&
      metricDefinitions.data
        .filter((item) => formikMetricValues.has(item.metric))
        .map((item) => item.scrape_interval);
    const maxInterval = Math.max(
      ...convertSeconds(intervalList ? intervalList : [])
    );
    getMaxInterval(maxInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch(name)]);

  const { append, fields, remove } = useFieldArray({
    control,
    name,
  });
  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
      <Box
        alignItems={'center'}
        display={'flex'}
        justifyContent={'space-between'}
        sx={{ marginBottom: 1 }}
      >
        <Typography variant={'h2'}>2. Criteria</Typography>
      </Box>
      <Stack spacing={2}>
        {fields.map((_, index) => (
          <Metric
            apiError={[isMetricDefinitionError, isMetricDefinitionLoading]}
            data={metricDefinitions ? metricDefinitions.data : []}
            key={index}
            name={`criteria[${index}]`}
            onMetricDelete={() => remove(index)}
          />
        ))}
      </Stack>
      <Button
        onClick={() =>
          append({
            aggregation_type: '',
            dimension_filters: [],
            metric: '',
            operator: '',
            value: '',
          })
        }
        buttonType={'outlined'}
        size="medium"
        sx={(theme) => ({ marginTop: theme.spacing(1) })}
      >
        Add Metric
      </Button>
    </Box>
  );
});
