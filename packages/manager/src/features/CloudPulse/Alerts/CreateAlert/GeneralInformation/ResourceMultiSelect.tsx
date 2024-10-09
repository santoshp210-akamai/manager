import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { ErrorMessage } from '../CreateAlertDefinition';
interface CloudPulseResourceSelectProps {
  /**
   * engine option type selected by the user
   */
  engine: string;
  /**
   * name used for the component to set the form field
   */
  name: string;
  /**
   * region selected by the user
   */
  region: string | undefined;
  /**
   * service type selected by the user
   */
  serviceType: string | undefined;
}
export interface CloudPulseResources {
  engine?: string;
  id: string;
  label: string;
  region?: string;
}

export const CloudPulseMultiResourceSelect = (
  props: CloudPulseResourceSelectProps
) => {
  const { engine, name, region, serviceType } = { ...props };
  const { control, setValue } = useFormContext();

  const [selectedResources, setSelectedResources] = React.useState<
    CloudPulseResources[]
  >([]);
  const { data: resources, isLoading } = useResourcesQuery(
    Boolean(region && serviceType),
    serviceType,
    {},
    engine !== '' ? { engine, region } : { region }
  );
  const getResourcesList = (): CloudPulseResources[] => {
    return resources && resources.length > 0 ? resources : [];
  };

  React.useEffect(() => {
    setValue(
      `${name}`,
      selectedResources.map((resource: CloudPulseResources) => {
        return resource.id.toString();
      })
    );
  }, [name, selectedResources, setValue]);

  React.useEffect(() => {
    setSelectedResources([]);
  }, [region, serviceType, engine]);

  return (
    <Controller
      render={({ field, fieldState }) => (
        <>
          <Autocomplete
            isOptionEqualToValue={(option, value) => {
              return option.id === value.id;
            }}
            onChange={(_, resources) => {
              setSelectedResources(resources);
            }}
            autoHighlight
            clearOnBlur
            data-testid="resource-select"
            disabled={!Boolean(region && serviceType)}
            label={serviceType === 'dbaas' ? 'Cluster' : 'Resources'}
            limitTags={2}
            loading={isLoading && Boolean(region && serviceType)}
            multiple
            onBlur={field.onBlur}
            options={getResourcesList()}
            placeholder="Select Resources"
            value={selectedResources}
          />
          <ErrorMessage
            errors={fieldState.error?.message}
            touched={fieldState.isTouched}
          />
        </>
      )}
      control={control}
      name={name}
    />
  );
};
