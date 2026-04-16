/**
 * Refactored Cypress test for "Create Block Storage Alert".
 *
 * Key improvements:
 * - Centralized mock setup.
 * - Clear data builders for alert + metrics.
 * - Reduced inline complexity; improved semantic clarity.
 */
import {
  linodeFactory,
  profileFactory,
  regionFactory,
} from '@linode/utilities';
import { statusMap } from 'support/constants/alert';
import { widgetDetails } from 'support/constants/widgets';
import { mockGetAccount } from 'support/intercepts/account';
import {
  mockCreateAlertDefinition,
  mockGetAlertChannels,
  mockGetAllAlertDefinitions,
  mockGetCloudPulseMetricDefinitions,
  mockGetCloudPulseServiceByType,
  mockGetCloudPulseServices,
} from 'support/intercepts/cloudpulse';
import { mockAppendFeatureFlags } from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { mockGetVolumes } from 'support/intercepts/volumes';
import { ui } from 'support/ui';

import {
  accountFactory,
  alertFactory,
  dashboardMetricFactory,
  flagsFactory,
  metricBuilder,
  notificationChannelFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  triggerConditionFactory,
  volumeFactory,
} from 'src/factories';
import { CREATE_ALERT_SUCCESS_MESSAGE } from 'src/features/CloudPulse/Alerts/constants';
import { entityGroupingOptions } from 'src/features/CloudPulse/Alerts/constants';
import { formatDate } from 'src/utilities/formatDate';

import type {
  AlertDefinitionMetricCriteria,
  DimensionFilter,
  Linode,
} from '@linode/api-v4';

export interface MetricDetails {
  aggregationType: string;
  dataField: string;
  operator: string;
  ruleIndex: number;
  threshold: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockAccount = accountFactory.build();
const { metrics } = widgetDetails.blockstorage;
const regionList = ['us-ord', 'us-east'];
const serviceType = 'blockstorage';
const notificationChannels = notificationChannelFactory.build({
  channel_type: 'email',
  id: 1,
  label: 'channel-1',
});
const BLOCK_STORAGE = 'Block Storage';
const REGION_LABEL = 'Chicago, IL';

const mockRegion = regionFactory.build({
  capabilities: [BLOCK_STORAGE],
  id: 'us-ord',
  label: REGION_LABEL,
  monitors: {
    metrics: [BLOCK_STORAGE],
    alerts: [BLOCK_STORAGE],
  },
});

const dimensions = [
  {
    label: 'Region',
    dimension_label: 'region',
    value: 'us-ord',
  },
];

// Convert widget filters to dashboard filters
const getFiltersForMetric = (metricName: string) => {
  const metric = metrics.find(({ name }) => name === metricName);
  if (!metric) return [];

  return metric.filters.map((filter) => ({
    dimension_label: filter.dimension_label,
    label: filter.dimension_label, // or friendly name
    // Ensure values is (string | undefined)[] | undefined
    values: filter.value
      ? Array.isArray(filter.value)
        ? filter.value.flat()
        : [filter.value]
      : undefined,
  }));
};

// Metric definitions
const metricDefinitions = metrics.map(({ name, title, unit }) =>
  dashboardMetricFactory.build({
    label: title,
    metric: name,
    unit,
    dimensions: [...dimensions, ...getFiltersForMetric(name)],
  })
);

const mockProfile = profileFactory.build({
  timezone: 'utc',
});

const mockAlerts = alertFactory.build({
  label: 'Alert-1',
  service_type: 'blockstorage',
  entities: {
    count: 1,
    has_more_resources: false,
    url: '/v4/monitor/services/blockstorage/alert-definitions/1/entities',
  },
});

const CREATE_ALERT_PAGE_URL = '/alerts/definitions/create';

const DataField = 'Data Field';
const BE_VISIBLE = 'be.visible';
const ADD_DIMENSION_FILTER = 'Add dimension filter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fills metric details in the form.
 */
const fillMetricDetailsForSpecificRule = ({
  aggregationType,
  dataField,
  operator,
  ruleIndex,
  threshold,
}: MetricDetails) => {
  cy.get(`[data-testid="rule_criteria.rules.${ruleIndex}-id"]`).within(() => {
    // Fill Data Field
    ui.autocomplete.findByLabel(DataField).should(BE_VISIBLE).type(dataField);
    ui.autocompletePopper.findByTitle(dataField).should(BE_VISIBLE).click();

    // Validate Aggregation Type
    ui.autocomplete
      .findByLabel('Aggregation Type')
      .should(BE_VISIBLE)
      .type(aggregationType);
    ui.autocompletePopper
      .findByTitle(aggregationType)
      .should(BE_VISIBLE)
      .click();

    // Fill Operator
    ui.autocomplete.findByLabel('Operator').should(BE_VISIBLE).type(operator);
    ui.autocompletePopper.findByTitle(operator).should(BE_VISIBLE).click();

    // Fill Threshold
    cy.get('[data-qa-threshold]').should(BE_VISIBLE).clear();
    cy.get('[data-qa-threshold]').should(BE_VISIBLE).type(threshold);
  });
};

/**
 * Verifies that a specific alert row in the alert definitions table is correctly displayed.
 */
const verifyAlertRow = (
  label: string,
  status: string,
  statusMap: Record<string, string>,
  createdBy: string,
  updated: string
) => {
  cy.findByText(label)
    .closest('tr')
    .should('exist')
    .then(($row) => {
      cy.wrap($row).within(() => {
        cy.findByText(label).should(BE_VISIBLE);
        cy.findByText(statusMap[status]).should(BE_VISIBLE);
        cy.findByText('Volumes').should(BE_VISIBLE);
        cy.findByText(createdBy).should(BE_VISIBLE);
        cy.findByText(
          formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: 'GMT',
          })
        ).should(BE_VISIBLE);
      });
    });
};

const mockLinodes: Linode[] = [
  linodeFactory.build({
    id: 1,
    label: 'Linode 1',
    region: 'us-ord',
  }),
];

const mockVolumesEncrypted = [
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord',
    region: 'us-ord', // Chicago
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-ord1',
    region: 'us-ord', // Chicago
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-west',
    region: 'us-west', // Fremont
  }),
  volumeFactory.build({
    encryption: 'enabled',
    label: 'test-volume-eu',
    region: 'eu-central', // Frankfurt
  }),
];

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('Blockstorage alert configured successfully', () => {
  entityGroupingOptions.forEach(({ label: groupLabel, value }) => {
    it(`should successfully create a new alert for ${groupLabel} level`, () => {
      const alerts = alertFactory.build({
        alert_channels: [{ id: 1 }],
        created_by: 'user1',
        description: 'My Custom Description',
        label: 'Alert-1',
        entities: {
          count: 1,
          has_more_resources: false,
          url: '/v4/monitor/services/blockstorage/alert-definitions/1/entities',
        },
        rule_criteria: {
          rules: [
            metricBuilder.build({
              metric: 'volume_read_ops',
              dimension_filters: [
                {
                  dimension_label: 'region',
                  operator: 'eq',
                  value: REGION_LABEL,
                },
                {
                  // match what UI test enters
                  dimension_label: 'response_type',
                  operator: 'in',
                  value: '200,400,500',
                },
                {
                  dimension_label: 'entity_id',
                  operator: 'eq',
                  value: 'blocket',
                },
              ],
            }),
          ],
        },
        service_type: 'blockstorage',
        severity: 0,
        tags: [''],
        trigger_conditions: triggerConditionFactory.build(),
        scope: value,
        ...(value === 'region' ? { regions: regionList } : {}),
      });

      const services = serviceTypesFactory.build({
        service_type: serviceType,
        label: 'blockstorage',
        alert: serviceAlertFactory.build({
          evaluation_period_seconds: [300],
          polling_interval_seconds: [300],
        }),
      });
      const { created_by, status, updated } = mockAlerts;

      // --- Setup Mocks ---
      mockAppendFeatureFlags(flagsFactory.build());
      mockGetAccount(mockAccount);
      mockGetProfile(mockProfile);
      mockGetCloudPulseServices([serviceType]);
      mockGetCloudPulseMetricDefinitions(serviceType, metricDefinitions);
      mockGetVolumes(mockVolumesEncrypted);
      mockGetAllAlertDefinitions([alerts]).as('getAlertDefinitionsList');
      mockGetAlertChannels([notificationChannels]);
      mockGetLinodes(mockLinodes);
      mockGetCloudPulseServiceByType(serviceType, services);
      mockCreateAlertDefinition(serviceType, alerts).as(
        'createAlertDefinition'
      );
      mockGetRegions([mockRegion]);

      // --- Navigate ---
      cy.visitWithLogin(CREATE_ALERT_PAGE_URL);

      // --- Section 1: Overview ---
      cy.findByPlaceholderText('Enter a Name').type(alerts.label);
      cy.findByPlaceholderText('Enter a Description').type(
        alerts.description || ''
      );

      ui.autocomplete.findByLabel('Service').type('volume');
      ui.autocompletePopper.findByTitle('Volumes').click();

      ui.tooltip.findByText(
        'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.'
      );
      ui.autocomplete.findByLabel('Severity').type('Severe');
      ui.autocompletePopper.findByTitle('Severe').click();

      ui.tooltip.findByText(
        'The set of entities to which the alert applies: account-wide, specific regions, or individual entities.'
      );

      ui.autocomplete
        .findByLabel('Scope')
        .should(BE_VISIBLE)
        .clear()
        .type(groupLabel);
      ui.autocompletePopper.findByTitle(groupLabel).should(BE_VISIBLE).click();

      // --- Section 2: Entities ---
      if (groupLabel !== 'Account') {
        cy.get('[data-testid="select_all_notice"]').click();
      }

      const REGION_US_CHICAGO = 'US, Chicago, IL (us-ord)';
      const expectedData = [
        { entity: 'test-volume-ord', region: REGION_US_CHICAGO },
        { entity: 'test-volume-ord1', region: REGION_US_CHICAGO },
      ];

      if (groupLabel === 'Entity') {
        cy.get('[data-testid="alert_resources_content"] tr').each(
          ($row, index) => {
            cy.wrap($row).within(() => {
              cy.get(`[data-qa-alert-cell="${index + 1}_entity"]`)
                .invoke('text')
                .then((entityText) => {
                  const entity = entityText.trim();

                  cy.get(`[data-qa-alert-cell="${index + 1}_region"]`)
                    .invoke('text')
                    .then((regionText) => {
                      const region = regionText.trim();
                      expect(entity).to.eq(expectedData[index].entity);
                      expect(region).to.eq(expectedData[index].region);
                    });
                });
            });
          }
        );
      }

      const expectedRegions = [
        { region: 'US, Chicago, IL (us-ord)', entities: '2' },
      ];

      if (groupLabel === 'Region') {
        cy.get('[data-testid="region-table"] tbody tr').each(($row, index) => {
          cy.wrap($row)
            .find('td')
            .eq(1)
            .invoke('text')
            .then((regionText) => {
              const region = regionText.trim();

              cy.wrap($row)
                .find('td')
                .eq(2)
                .invoke('text')
                .then((entitiesText) => {
                  const entities = entitiesText.trim();

                  expect(region).to.eq(expectedRegions[index].region);
                  expect(entities).to.eq(
                    expectedRegions[index].entities.toString()
                  );
                });
            });
        });
      }

      // --- Section 3: Metrics ---
      const allRequestsMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'Volume Read Operations',
        operator: '=',
        ruleIndex: 0,
        threshold: '1000',
      };
      fillMetricDetailsForSpecificRule(allRequestsMetricDetails);

      // Add metrics button interaction
      cy.findByRole('button', { name: 'Add metric' })
        .should(BE_VISIBLE)
        .click();

      // Rule 1: Region Equal flow
      ui.buttonGroup
        .findButtonByTitle(ADD_DIMENSION_FILTER)
        .should(BE_VISIBLE)
        .click();

      ui.autocomplete
        .findByLabel(DataField)
        .should(BE_VISIBLE)
        .eq(1)
        .type('Region');
      ui.autocompletePopper.findByTitle('Region').should(BE_VISIBLE).click();

      ui.autocomplete.findByLabel('Operator').eq(1).should(BE_VISIBLE).clear();
      ui.autocomplete.findByLabel('Operator').eq(1).type('Equal');
      cy.findByText('Equal').should(BE_VISIBLE).click();

      cy.findByPlaceholderText('Enter a Value')
        .should(BE_VISIBLE)
        .type(REGION_LABEL);

      // Rule 1: response_type IN flow
      ui.buttonGroup
        .findButtonByTitle(ADD_DIMENSION_FILTER)
        .should(BE_VISIBLE)
        .click();

      ui.autocomplete.findByLabel(DataField).eq(2).should(BE_VISIBLE).clear();
      ui.autocomplete
        .findByLabel(DataField)
        .should(BE_VISIBLE)
        .eq(2)
        .type('response_type');
      cy.findByText('response_type').should(BE_VISIBLE).click();

      ui.autocomplete.findByLabel('Operator').eq(2).type('In');
      cy.findByText('In').should(BE_VISIBLE).click();

      const VALUE_INPUT_ALIAS = '@valueInput';

      cy.get(
        '[data-qa-dimension-filter="rule_criteria.rules.0.dimension_filters.1-value"] input'
      )
        .should(BE_VISIBLE)
        .as('valueInput'); // <-- Correctly mapped alias for the first field

      cy.get(VALUE_INPUT_ALIAS).click();
      cy.get(VALUE_INPUT_ALIAS).type('200,400,500{enter}');

      // Rule 1: entity_id Equal flow
      ui.buttonGroup
        .findButtonByTitle(ADD_DIMENSION_FILTER)
        .should(BE_VISIBLE)
        .click();

      ui.autocomplete.findByLabel(DataField).eq(3).should(BE_VISIBLE).clear();
      ui.autocomplete
        .findByLabel(DataField)
        .should(BE_VISIBLE)
        .eq(3)
        .type('entity_id');
      cy.findByText('entity_id').should(BE_VISIBLE).click();

      ui.autocomplete.findByLabel('Operator').eq(3).type('Equal');
      cy.findByText('Equal').should(BE_VISIBLE).click();

      // Alias re-mapped to the newest input field
      cy.get(
        '[data-qa-dimension-filter="rule_criteria.rules.0.dimension_filters.2-value"] input'
      )
        .should(BE_VISIBLE)
        .as('valueInput');

      cy.get(VALUE_INPUT_ALIAS).click();
      cy.get(VALUE_INPUT_ALIAS).type('blocket{enter}');

      // Rule 2 configuration
      const totalBucketSizeMetricDetails = {
        aggregationType: 'Avg',
        dataField: 'Volume Write Operations',
        operator: '=',
        ruleIndex: 1,
        threshold: '1000',
      };
      fillMetricDetailsForSpecificRule(totalBucketSizeMetricDetails);

      // --- Section 4: Trigger Conditions ---
      ui.autocomplete
        .findByLabel('Evaluation Period')
        .should(BE_VISIBLE)
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should(BE_VISIBLE).click();

      ui.autocomplete
        .findByLabel('Polling Interval')
        .should(BE_VISIBLE)
        .type('5 min');
      ui.autocompletePopper.findByTitle('5 min').should(BE_VISIBLE).click();

      cy.get('[data-qa-trigger-occurrences]').should(BE_VISIBLE).clear();
      cy.get('[data-qa-trigger-occurrences]').should(BE_VISIBLE).type('5');

      // --- Section 5: Notification Channels ---
      ui.buttonGroup.find().contains('Add notification channel').click();

      ui.autocomplete.findByLabel('Type').should(BE_VISIBLE).type('Email');
      ui.autocompletePopper.findByTitle('Email').should(BE_VISIBLE).click();

      ui.autocomplete
        .findByLabel('Channel')
        .should(BE_VISIBLE)
        .type('channel-1');
      ui.autocompletePopper.findByTitle('channel-1').should(BE_VISIBLE).click();

      ui.drawer
        .findByTitle('Add Notification Channel')
        .should(BE_VISIBLE)
        .within(() => {
          ui.buttonGroup
            .findButtonByTitle('Add channel')
            .should(BE_VISIBLE)
            .click();
        });

      // --- Submit & Verify ---
      ui.buttonGroup
        .find()
        .find('button')
        .filter('[type="submit"]')
        .should(BE_VISIBLE)
        .should('be.enabled')
        .click();

      cy.wait('@createAlertDefinition').then(({ request, response }) => {
        const reqBody = request.body;
        const resBody = response?.body;

        // --- Sanity Checks ---
        expect(resBody).to.have.property('id');
        expect(resBody).to.have.property('label', reqBody.label);
        expect(resBody).to.have.property('service_type', 'blockstorage');
        expect(resBody).to.have.property('status', 'enabled');
        expect(resBody).to.have.property('severity', reqBody.severity);

        // --- Compare Rule Criteria ---
        const reqRules = reqBody.rule_criteria.rules;
        const resRules = resBody.rule_criteria.rules;
        resRules.forEach(
          (rule: AlertDefinitionMetricCriteria, index: number) => {
            const reqRule = reqRules[index];

            // Basic field checks
            expect(rule.metric, `Metric mismatch at rule[${index}]`).to.eq(
              reqRule.metric
            );
            expect(rule.operator, `Operator mismatch at rule[${index}]`).to.eq(
              reqRule.operator
            );
            expect(
              rule.aggregate_function,
              `Aggregate function mismatch at rule[${index}]`
            ).to.eq(reqRule.aggregate_function);
            expect(
              rule.threshold,
              `Threshold mismatch at rule[${index}]`
            ).to.eq(reqRule.threshold);

            // Validate dimension_filters
            expect(
              rule.dimension_filters,
              `rule[${index}] dimension_filters should exist`
            ).to.exist;
            expect(
              rule.dimension_filters,
              `rule[${index}] dimension_filters should be an array`
            ).to.be.an('array').that.is.not.empty;

            const resFilters = rule.dimension_filters ?? [];
            const reqFilters = reqRule.dimension_filters ?? [];

            resFilters.forEach((filter: DimensionFilter) => {
              const matchingReqFilter = reqFilters.find(
                (f: DimensionFilter) =>
                  f.dimension_label === filter.dimension_label &&
                  f.operator === filter.operator
              );

              expect(
                matchingReqFilter,
                `No matching request filter found for label '${filter.dimension_label}' and operator '${filter.operator}'`
              ).to.exist;

              if (matchingReqFilter) {
                if (filter.operator?.toLowerCase() === 'in') {
                  // Handle 'in' operator as array comparison
                  const resValues: string[] = Array.isArray(filter.value)
                    ? filter.value
                    : (filter.value as string).split(',').map((v) => v.trim());

                  const reqValues: string[] = Array.isArray(
                    matchingReqFilter.value
                  )
                    ? matchingReqFilter.value
                    : (matchingReqFilter.value as string)
                        .split(',')
                        .map((v) => v.trim());

                  reqValues.forEach((v: string) => {
                    expect(
                      resValues,
                      `Value '${v}' from request filter '${filter.dimension_label}' not found in response`
                    ).to.include(v);
                  });
                } else {
                  // For other operators, assert equality
                  expect(
                    filter.value,
                    `Value mismatch for filter '${filter.dimension_label}' and operator '${filter.operator}'`
                  ).to.eq(matchingReqFilter.value);
                }
              }
            });

            // Verify dimension labels and operators only (ignore value for order issues)
            const sortedResFilters = [...resFilters].sort(
              (a, b) =>
                a.dimension_label.localeCompare(b.dimension_label) ||
                a.operator.localeCompare(b.operator)
            );
            const sortedReqFilters = [...reqFilters].sort(
              (a, b) =>
                a.dimension_label.localeCompare(b.dimension_label) ||
                a.operator.localeCompare(b.operator)
            );
            expect(
              sortedResFilters.map((f) => ({
                label: f.dimension_label,
                op: f.operator,
              })),
              `Dimension labels/operators mismatch at rule[${index}]`
            ).to.deep.eq(
              sortedReqFilters.map((f) => ({
                label: f.dimension_label,
                op: f.operator,
              }))
            );

            // --- Compare Other Metadata ---
            expect(resBody.label).to.eq(reqBody.label);
            expect(resBody.class).to.eq('dedicated');
            expect(resBody.service_type).to.eq('blockstorage');

            // Note: Validating against request payload properties where appropriate.
            if (resBody.entity_ids && reqBody.entity_ids) {
              expect(resBody.entity_ids).to.deep.eq(reqBody.entity_ids);
            }

            expect(resBody.scope).to.eq(reqBody.scope);

            cy.url().should('endWith', '/alerts/definitions');
            ui.toast.assertMessage(CREATE_ALERT_SUCCESS_MESSAGE);
            verifyAlertRow('Alert-1', status, statusMap, created_by, updated);
          }
        );
      });
    });
  });
});
