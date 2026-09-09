export interface RechargePack {
  id: string;
  label: string;
  priceInPaise: number;
  turns: number;
}

// Recharge packs, not subscriptions — turns are credited once and never
// expire or reset on a cycle. New signups start with the free trial amount
// below; buying a pack just adds more to the same balance.
//
// 10 -> 3 -> 10 (2026-09-08, then 2026-09-09). Cut to 3 on the theory that
// every new account is a free grant of Sarvam calls billed to us, but 3 turns
// is one side of a single exchange — not enough for someone to actually feel
// what the product does. Restored to 10 on the user's call: Google-only
// sign-in (same commit as the original cut) already makes accounts hard to
// mass-create, so the trial size doesn't need to carry that job too.
// `findOrCreateUser` applies this explicitly, so the `turns_balance` column
// default (also 10, in schema.ts) is redundant with this but not relied on.
export const FREE_TRIAL_TURNS = 10;

export const RECHARGE_PACKS: RechargePack[] = [
  { id: 'starter', label: 'Starter', priceInPaise: 9900, turns: 150 },
  { id: 'plus', label: 'Plus', priceInPaise: 29900, turns: 600 },
  { id: 'pro', label: 'Pro', priceInPaise: 69900, turns: 2000 },
];

export function getPack(id: string): RechargePack | undefined {
  return RECHARGE_PACKS.find((pack) => pack.id === id);
}
