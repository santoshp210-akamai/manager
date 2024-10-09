import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { databaseEngineFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { EngineOption } from './EngineOption';

const engineOptions = databaseEngineFactory.buildList(2);
describe('EngineOption component tests', () => {
  it('should render the component when resource type is dbaas', () => {
    const { getByLabelText, getByTestId } = renderWithThemeAndHookFormContext({
      component: (
        <EngineOption
          engineOptions={engineOptions}
          isError={false}
          isLoading={false}
          name={'engineOption'}
        />
      ),
    });
    expect(getByLabelText('Engine Options')).toBeInTheDocument();
    expect(getByTestId('engine-options')).toBeInTheDocument();
  });
  it('should render the options happy path', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EngineOption
          engineOptions={engineOptions}
          isError={true}
          isLoading={true}
          name={'engineOption'}
        />
      ),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('option', { name: 'test/1' }));
    expect(screen.getByRole('option', { name: 'test/2' }));
  });
  it('should be able to select an option', () => {
    renderWithThemeAndHookFormContext({
      component: (
        <EngineOption
          engineOptions={engineOptions}
          isError={true}
          isLoading={true}
          name={'engineOption'}
        />
      ),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'test/1' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'test/1');
  });
});
