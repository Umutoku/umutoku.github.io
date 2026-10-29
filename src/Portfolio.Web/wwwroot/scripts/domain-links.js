// Public, illustrative relationships; never an employer's production topology.
export const domainLinks = {
  product: { caseId: 'work-product', related: ['search', 'database', 'cache'] },
  search: { caseId: 'work-search', related: ['product', 'events', 'database'] },
  database: { caseId: 'work-data', related: ['product', 'cache', 'search'] },
  cache: { caseId: 'work-data', related: ['product', 'database'] },
  events: { caseId: 'work-jobs', related: ['product', 'search', 'operations'] },
  gateway: { caseId: 'work-identity', related: ['product', 'payment'] },
  payment: { caseId: 'work-payment', related: ['events', 'gateway', 'operations'] },
  operations: { caseId: 'work-operations', related: ['events', 'search', 'database'] },
  client: { caseId: 'work-identity', related: ['gateway'] },
  erp: { caseId: 'work-payment', related: ['payment', 'events'] }
};
