/* eslint-disable no-console */
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { WithStartAndEnd } from 'src/features/Longview/request.types';

import { CloudViewIntervalSelect } from '../shared/IntervalSelect';
import { CloudViewRegionSelect } from '../shared/RegionSelect';
import { CloudViewMultiResourceSelect } from '../shared/ResourceMultiSelect';
import {
  CloudViewResourceSelect,
  CloudViewResourceTypes,
} from '../shared/ResourceSelect';
import { CloudViewServiceSelect } from '../shared/ServicetypeSelect';
import { CloudViewTimeRangeSelect } from '../shared/TimeRangeSelect';

export const GlobalFilters = React.memo(() => {
  const theme = useTheme();

  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });

  const [selectedInterval, setInterval] = React.useState<string>();

  const [selectedRegion, setRegion] = React.useState<string>();

  const [selectedResourceId, setResourceId] = React.useState<any>();

  const [
    selectedService,
    setService,
  ] = React.useState<CloudViewResourceTypes>();

  const handleTimeRangeChange = (start: number, end: number) => {
    console.log('TimeRange: ', start, end);
    setTimeBox({ end, start });
  };

  const handleIntervalChange = (interval: string | undefined) => {
    console.log('Interval: ', interval);
    setInterval(interval);
  };

  const handleRegionChange = (region: string | undefined) => {
    console.log('Region: ', region);
    setRegion(region);
  };

  const handleResourceChange = (resourceId: any) => {
    console.log('Resource ID: ', resourceId);
    setResourceId(resourceId);
  };

  const handleServiceChange = (service: CloudViewResourceTypes) => {
    console.log('Service Type: ', service);
    setService(service);
  };

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ fontSize: 'medium' }}>
          <div>Region</div>
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 250 }}>
          <StyledCloudViewRegionSelect
            handleRegionChange={handleRegionChange}
          />
        </Grid>
        <Grid sx={{ fontSize: 'medium', marginLeft: 4 }}>
          <div>Service Type</div>
        </Grid>
        <Grid sx={{ marginLeft: 0.2, width: 100 }}>
          <CloudViewServiceSelect handleServiceChange={handleServiceChange} />
        </Grid>
        <Grid sx={{ fontSize: 'medium', marginLeft: 6 }}>
          <div>Resource</div>
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 400 }}>
          <StyledCloudViewResourceSelect
            disabled={!selectedService}
            handleResourceChange={handleResourceChange}
            region={selectedRegion}
            resourceType={selectedService}
          />
        </Grid>
        {/* <Grid sx={{ marginLeft: 8 }}>
          <StyledCloudViewIntervalSelect
            handleIntervalChange={handleIntervalChange}
          />
        </Grid> */}
        {/* <Grid sx={{ marginLeft: 3 }}>
          <StyledCloudViewTimeRangeSelect
            defaultValue={'Past 30 Minutes'}
            handleStatsChange={handleTimeRangeChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid> */}
      </StyledGrid>
    </Grid>
  );
});

const StyledCloudViewRegionSelect = styled(CloudViewRegionSelect, {
  label: 'StyledCloudViewRegionSelect',
})({
  width: 100,
});

const StyledCloudViewResourceSelect = styled(CloudViewMultiResourceSelect, {
  label: 'StyledCloudViewResourceSelect',
})({
  width: 500,
});

// const StyledCloudViewTimeRangeSelect = styled(CloudViewTimeRangeSelect, {
//   label: 'StyledCloudViewTimeRangeSelect',
// })({
//   width: 150,
// });

// const StyledCloudViewIntervalSelect = styled(CloudViewIntervalSelect, {
//   label: 'StyledCloudViewIntervalSelect',
// })({
//   width: 40,
// });

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  alignItems: 'end',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
  marginBottom: theme.spacing(1.25),
}));

const itemSpacing = {
  boxSizing: 'border-box',
  margin: '0',
};
