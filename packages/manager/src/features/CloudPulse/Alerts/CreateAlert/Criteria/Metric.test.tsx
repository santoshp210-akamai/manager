import { fireEvent, screen, within } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Metric } from './Metric';

import type { MetricDefinitions } from '@linode/api-v4';
const DATA_FIELD_OPTION = 'CPU utilization';
const mockData: MetricDefinitions = {
  data: [
    {
      available_aggregate_functions: ['min', 'max', 'avg'],
      dimensions: [
        {
          dimension_label: 'cpu',
          label: 'CPU name',
          values: [],
        },
        {
          dimension_label: 'state',
          label: 'State of CPU',
          values: [
            'user',
            'system',
            'idle',
            'interrupt',
            'nice',
            'softirq',
            'steal',
            'wait',
          ],
        },
        {
          dimension_label: 'LINODE_ID',
          label: 'Linode ID',
          values: [],
        },
      ],
      label: 'CPU utilization',
      metric: 'system_cpu_utilization_percent',
      metric_type: 'gauge',
      scrape_interval: '2m',
      unit: 'percent',
    },
  ],
};

vi.mock('./DimensionFilter', () => {
  return {
    DimensionFilter: () => {
      return <div />;
    },
    default: () => {
      return <div />;
    },
  };
});
describe('Metric component tests', () => {
  it('should render all the components and names', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <Metric
          apiError={[false, false]}
          data={mockData.data}
          name={'criteria'}
          onMetricDelete={vi.fn()}
        />
      ),
    });
    expect(container.getByLabelText('Data Field')).toBeInTheDocument();
    expect(container.getByLabelText('Aggregation type')).toBeInTheDocument();
    expect(container.getByLabelText('Operator')).toBeInTheDocument();
    expect(container.getByLabelText('Value')).toBeInTheDocument();
  });
  it('should show the options for the Autocomplete component', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <Metric
          apiError={[false, false]}
          data={mockData.data}
          name={'criteria'}
          onMetricDelete={vi.fn()}
        />
      ),
    });
    const dataFieldContainer = container.getByTestId('Data-field');
    const dataFieldInput = within(dataFieldContainer).getByRole('button', {
      name: 'Open',
    });
    fireEvent.click(dataFieldInput);
    expect(
      screen.getByRole('option', { name: DATA_FIELD_OPTION })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: DATA_FIELD_OPTION }));
    const aggregationTypeContainer = container.getByTestId('Aggregation-type');
    const aggregationTypeInput = within(
      aggregationTypeContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(aggregationTypeInput);
    expect(screen.getByRole('option', { name: 'min' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'avg' })).toBeInTheDocument();

    const operatorContainer = container.getByTestId('Operator');
    const operatorInput = within(operatorContainer).getByRole('button', {
      name: 'Open',
    });

    fireEvent.click(operatorInput);
    expect(screen.getByRole('option', { name: '>' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '>=' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '==' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '<' })).toBeInTheDocument();
  });
  it('should be able to select the chosen option', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <Metric
          apiError={[false, false]}
          data={mockData.data}
          name={'criteria'}
          onMetricDelete={vi.fn()}
        />
      ),
    });
    const dataFieldContainer = container.getByTestId('Data-field');
    const dataFieldInput = within(dataFieldContainer).getByRole('button', {
      name: 'Open',
    });
    fireEvent.click(dataFieldInput);
    fireEvent.click(screen.getByRole('option', { name: DATA_FIELD_OPTION }));
    expect(within(dataFieldContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      DATA_FIELD_OPTION
    );
    const aggregationTypeContainer = container.getByTestId('Aggregation-type');
    const aggregationTypeInput = within(
      aggregationTypeContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(aggregationTypeInput);
    fireEvent.click(screen.getByRole('option', { name: 'avg' }));
    expect(
      within(aggregationTypeContainer).getByRole('combobox')
    ).toHaveAttribute('value', 'avg');
  });
});
