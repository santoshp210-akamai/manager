import { fireEvent, screen, within } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TriggerConditions } from './TriggerConditions';

const EvaluationPeriodTestId = 'Evaluation-period';

const PollingIntervalTestId = 'Polling-interval';
describe('Trigger Conditions', () => {
  it('should render all the components and names', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name={'triggercondition'} />
      ),
    });
    expect(container.getByLabelText('Evaluation period')).toBeInTheDocument();
    expect(container.getByLabelText('Polling interval')).toBeInTheDocument();
    expect(container.getByLabelText('Trigger alert when')).toBeInTheDocument();
    expect(
      container.getByText('criteria are met for at least')
    ).toBeInTheDocument();
    expect(container.getByText('occurences.')).toBeInTheDocument();
  });

  it('should show the options for the Autocomplete component', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name={'triggercondition'} />
      ),
    });

    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(
      evaluationPeriodContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(evaluationPeriodInput);
    expect(
      screen.getByRole('option', {
        name: '30m',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: '1hr',
      })
    ).toBeInTheDocument();

    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalInput = within(
      pollingIntervalContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(pollingIntervalInput);
    expect(
      screen.getByRole('option', {
        name: '5m',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: '10m',
      })
    );

    const triggerAlertconditionContainer = container.getByTestId(
      'Trigger-alert-condition'
    );
    const triggerAlertConditionInput = within(
      triggerAlertconditionContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(triggerAlertConditionInput);
    expect(screen.getByRole('option', { name: 'ALL' }));
    expect(screen.getByRole('option', { name: 'ANY' }));
  });

  it('should render the tooltips for the Autocomplete components', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name={'triggercondition'} />
      ),
    });

    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodToolTip = within(evaluationPeriodContainer).getByRole(
      'button',
      {
        name: 'Choose the data lookback period on which thresholds are applied',
      }
    );
    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalToolTip = within(pollingIntervalContainer).getByRole(
      'button',
      {
        name: 'Choose how often you intend to evaulate the alert condition',
      }
    );
    expect(evaluationPeriodToolTip).toBeInTheDocument();
    expect(pollingIntervalToolTip).toBeInTheDocument();
  });
  it('should be able to select the chosen option', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions maxScrapingInterval={0} name={'triggercondition'} />
      ),
    });
    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(
      evaluationPeriodContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(evaluationPeriodInput);
    fireEvent.click(screen.getByRole('option', { name: '30m' }));
    expect(
      within(evaluationPeriodContainer).getByRole('combobox')
    ).toHaveAttribute('value', '30m');

    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalInput = within(
      pollingIntervalContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(pollingIntervalInput);
    fireEvent.click(screen.getByRole('option', { name: '5m' }));
    expect(
      within(pollingIntervalContainer).getByRole('combobox')
    ).toHaveAttribute('value', '5m');
  });
  it('should be able to show the options that are greater than or equal to max scraping Interval', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <TriggerConditions
          maxScrapingInterval={120}
          name={'triggercondition'}
        />
      ),
    });
    const evaluationPeriodContainer = container.getByTestId(
      EvaluationPeriodTestId
    );
    const evaluationPeriodInput = within(
      evaluationPeriodContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(evaluationPeriodInput);
    expect(screen.queryByText('1m')).not.toBeInTheDocument();

    const pollingIntervalContainer = container.getByTestId(
      PollingIntervalTestId
    );
    const pollingIntervalInput = within(
      pollingIntervalContainer
    ).getByRole('button', { name: 'Open' });
    fireEvent.click(pollingIntervalInput);
    expect(screen.queryByText('1m')).not.toBeInTheDocument();
  });
});
