// Dev default: empty base URL means every `/api/...` call stays relative,
// handled by proxy.conf.json forwarding to the local API. See
// environment.production.ts for the deployed-API case.
export const environment = {
  apiBaseUrl: '',
  // When true, every route except /waitlist redirects to /waitlist and the
  // site's nav/footer are hidden — the pre-launch "waitlist only" mode.
  // Off in dev so the whole app stays reachable while building.
  waitlistOnly: false,
};
