import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { ErrorMessage } from '../CreateAlertDefinition';

interface EngineOptionProps {
  /**
   * list of engine options available
   */
  engineOptions: any[];
  /**
   * if the engine options query has encountered an error
   */
  isError: boolean;
  /**
   * if the engine options are still loading or not
   */
  isLoading: boolean;
  /**
   * name used for the component to set formik field
   */
  name: string;
}
interface CloudPulseEngineOptionType {
  group: '';
  label: '';
}
export const EngineOption = (props: EngineOptionProps) => {
  const [
    selectedDatabase,
    setDatabase,
  ] = React.useState<CloudPulseEngineOptionType | null>(null);
  const { control, setValue } = useFormContext();
  const { engineOptions, isError, isLoading, name } = props;

  React.useEffect(() => {
    setValue(name, selectedDatabase?.group ?? '');
  }, [name, selectedDatabase, setValue]);

  const getEnginesList = () => {
    if (engineOptions === undefined) {
      return [];
    }
    return (
      engineOptions?.map((option) => ({
        group: option.engine,
        label: option.id,
      })) ?? []
    );
  };

  return (
    <Controller
      render={({ field, fieldState }) => (
        <>
          <Autocomplete
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            onChange={(_, newValue: CloudPulseEngineOptionType, reason) =>
              reason === 'selectOption' && setDatabase(newValue)
            }
            data-testid="engine-options"
            errorText={isError ? 'Unable to load Engine Options' : ''}
            groupBy={(option) => option.group}
            label="Engine Options"
            loading={isLoading && !isError}
            onBlur={field.onBlur}
            options={getEnginesList()}
            value={selectedDatabase}
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
