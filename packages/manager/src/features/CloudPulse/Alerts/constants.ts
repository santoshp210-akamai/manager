export const AlertSeverityOptions = [
  { label: 'Info - 3', value: 'info' },
  { label: 'Low - 2 ', value: 'low' },
  { label: 'Medium - 1', value: 'medium' },
  { label: 'Severe - 0', value: 'severe' },
];

export const DimensionOperatorOptions = [
  {
    label: 'is',
    value: 'is',
  },
  {
    label: 'contains',
    value: 'contains',
  },
];

export const MetricOperatorOptions = [
  {
    label: '>',
    value: '>',
  },
  {
    label: '<',
    value: '<',
  },
  {
    label: '>=',
    value: '>=',
  },
  {
    label: '<=',
    value: '<=',
  },
  {
    label: '==',
    value: '==',
  },
];
export const EvaluationPeriodOptions = [
  { label: '1m', value: '60' },
  { label: '5m', value: '300' },
  { label: '15m', value: '900' },
  { label: '30m', value: '1800' },
  { label: '1hr', value: '3600' },
];

export const PollingIntervalOptions = [
  {
    label: '1m',
    value: '60',
  },
  {
    label: '5m',
    value: '300',
  },
  {
    label: '10m',
    value: '600',
  },
];

export const TriggerOptions = [
  { label: 'ALL', value: 'ALL' },
  { label: 'ANY', value: 'ANY' },
];

export const convertSeconds = (secondsList: string[]) => {
  return secondsList.map((second) => {
    const unit = second.slice(-1)[0];
    const number = parseInt(second.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return number;
      case 'm':
        return number * 60;
      case 'h':
        return number * 3600;
      default:
        return number * 0;
    }
  });
};

export const ChannelTypeOptions = [
  {
    label: 'Email',
    value: 'email',
  },
];
