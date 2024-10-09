import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { Grid, styled } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';

import { DimensionOperatorOptions } from '../../constants';
import { ControllerErrorMessage } from './Metric';

import type { Dimension } from '@linode/api-v4';

interface DimensionFilterFieldProps {
  /**
   * dimension filter data options to list in the Autocomplete component
   */
  dimensionOptions: Dimension[];
  /**
   * name (with the index) used for the component to set in form
   */
  name: string;
  /**
   * function to delete the DimensionFilter component
   * @returns void
   */
  onFilterDelete: () => void;
}
type DimensionDataFieldOption = {
  label: string;
  value: string;
};
export const DimensionFilterField = (props: DimensionFilterFieldProps) => {
  const { dimensionOptions, name, onFilterDelete } = props;

  const { control, setValue, watch } = useFormContext();

  const dataFieldOptions = dimensionOptions.map((dimension) => ({
    label: dimension.label,
    value: dimension.dimension_label,
  }));

  const [
    selectedDataField,
    setSelectedDataField,
  ] = React.useState<DimensionDataFieldOption | null>(null);

  const handleSelectChange = (
    field: string,
    value: string,
    operation: string
  ) => {
    if (operation === 'selectOption') {
      setValue(`${name}.${field}`, value);
    } else {
      setValue(`${name}.${field}`, '');
    }
  };

  const handleDataFieldChange = (value: string, operation: string) => {
    const fieldValue = {
      dimension_label: '',
      operator: '',
      value: '',
    };
    if (operation === 'selectOption') {
      setValue(name, { ...fieldValue, dimension_label: value });
    } else {
      setValue(name, fieldValue);
    }
  };

  const dimensionFieldWatcher = watch(`${name}.dimension_label`);
  const selectedDimension =
    dimensionOptions && dimensionFieldWatcher
      ? dimensionOptions.find(
          (dim) => dim.dimension_label === dimensionFieldWatcher
        )
      : null;

  const valueOptions =
    selectedDimension && selectedDimension.values
      ? selectedDimension.values.map((val) => ({ label: val, value: val }))
      : [];

  return (
    <>
      <Grid alignItems="center" container spacing={2}>
        <Grid item md={3} sm={3} xs={12}>
          <Controller
            render={({ field }) => (
              <Autocomplete
                isOptionEqualToValue={(option, value) =>
                  option.label === value.label
                }
                onChange={(_, newValue, operation) => {
                  handleDataFieldChange(newValue?.value ?? '', operation);
                  setSelectedDataField(newValue);
                }}
                data-testid="Data-field"
                label="Data Field"
                onBlur={field.onBlur}
                options={dataFieldOptions}
                value={selectedDataField}
              />
            )}
            control={control}
            name={`${name}.dimension_label`}
          />
        </Grid>
        <Grid item md={'auto'} sm={3} xs={12}>
          <Controller
            render={({ field }) => (
              <Autocomplete
                onChange={(_, newValue, operation) =>
                  handleSelectChange(
                    'operator',
                    newValue?.value ?? '',
                    operation
                  )
                }
                data-testid="Operator"
                isOptionEqualToValue={(option, value) => option.label === value}
                label={'Operator'}
                onBlur={field.onBlur}
                options={DimensionOperatorOptions}
                value={field.value !== '' ? field.value : null}
              />
            )}
            control={control}
            name={`${name}.operator`}
          />
        </Grid>
        <Grid item md={4} sm={6} xs={12}>
          <Grid alignItems="center" container spacing={0}>
            <Grid item md={8} sm={6} xs={10}>
              <Controller
                render={({ field }) => (
                  <Autocomplete
                    isOptionEqualToValue={(option, value) =>
                      option.label === value
                    }
                    onChange={(_, newValue, operation) =>
                      handleSelectChange(
                        'value',
                        newValue?.value ?? '',
                        operation
                      )
                    }
                    data-testid="Value"
                    label="Value"
                    onBlur={field.onBlur}
                    options={valueOptions}
                    value={field.value !== '' ? field.value : null}
                  />
                )}
                control={control}
                name={`${name}.value`}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item paddingLeft={1} sm={'auto'}>
          <StyledDeleteIcon onClick={onFilterDelete} />
        </Grid>
      </Grid>
      <Box>
        <ControllerErrorMessage
          component={`${name}.dimension_label`}
          control={control}
        />
        <ControllerErrorMessage
          component={`${name}.operator`}
          control={control}
        />
        <ControllerErrorMessage component={`${name}.value`} control={control} />
      </Box>
    </>
  );
};

const StyledDeleteIcon = styled(DeleteOutlineOutlined)(({ theme }) => ({
  '&:active': {
    transform: 'scale(0.9)',
  },
  '&:hover': {
    color: theme.color.blue,
  },
  color: theme.palette.text.primary,
  cursor: 'pointer',
  marginTop: '45px',
  padding: 0,
}));
