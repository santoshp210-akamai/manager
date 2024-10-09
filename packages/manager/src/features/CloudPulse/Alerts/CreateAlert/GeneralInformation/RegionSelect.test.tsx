import * as React from 'react';

import * as regions from 'src/queries/regions/regions';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseRegionSelect } from './RegionSelect';

import type { Region } from '@linode/api-v4';

describe('RegionSelect', () => {
  vi.spyOn(regions, 'useRegionsQuery').mockReturnValue({
    data: Array<Region>(),
  } as ReturnType<typeof regions.useRegionsQuery>);

  it('should render a RegionSelect component', () => {
    const { getByTestId } = renderWithThemeAndHookFormContext({
      component: <CloudPulseRegionSelect name={'region'} />,
    });
    expect(getByTestId('region-select')).toBeInTheDocument();
  });
});
