// Dev default: empty base URL means every `/api/...` call stays relative,
// handled by proxy.conf.json forwarding to the local API. See
// environment.production.ts for the deployed-API case.
export const environment = {
  apiBaseUrl: '',
};
