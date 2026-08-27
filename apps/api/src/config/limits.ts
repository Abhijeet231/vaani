// Free-trial cap: 10 turns (one record → one translation), lifetime, no reset.
// Paid-plan limiting isn't enforced yet — there's no payment flow to ever set
// plan: 'paid', so that branch would be dead code until it exists for real.
export const TRIAL_TURN_LIMIT = 10;
