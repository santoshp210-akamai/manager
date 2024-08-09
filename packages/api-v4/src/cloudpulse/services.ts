import { API_ROOT } from 'src/constants';
import Request, { setHeaders, setMethod, setURL } from '../request';
import { MetricDefinitions, ServiceTypes } from './types';
import { ResourcePage as Page } from 'src/types';

export const getCloudViewServiceTypes = () =>
  Request<ServiceTypes>(
    setURL(
      // `https://blr-lhv95n.bangalore.corp.akamai.com:9000/v4/monitor/services`
      `${API_ROOT}/monitor/services`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: 'Bearer vagrant',
    })
  );

export const getMetricDefinitionsByServiceType = (serviceType: string) => {
  return Request<Page<MetricDefinitions>>(
    setURL(
      // `https://blr-lhv95n.bangalore.corp.akamai.com:9000/v4/monitor/services/${serviceType}/metric-definitions`
      `${API_ROOT}/monitor/services/${serviceType}/metric-definitions`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: 'Bearer vagrant',
    })
  );
};
