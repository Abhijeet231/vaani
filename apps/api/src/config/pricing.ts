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
// Lowered 10 -> 3 (2026-09-08). Every new account is a free grant of Sarvam
// calls billed to us, so the trial has to be small enough that farming
// accounts isn't worth anyone's time, while still being enough to prove the
// product. `findOrCreateUser` applies this explicitly, so the `turns_balance`
// column default is no longer what new users actually get.
export const FREE_TRIAL_TURNS = 3;

export const RECHARGE_PACKS: RechargePack[] = [
  { id: 'starter', label: 'Starter', priceInPaise: 9900, turns: 150 },
  { id: 'plus', label: 'Plus', priceInPaise: 29900, turns: 600 },
  { id: 'pro', label: 'Pro', priceInPaise: 69900, turns: 2000 },
];

export function getPack(id: string): RechargePack | undefined {
  return RECHARGE_PACKS.find((pack) => pack.id === id);
}
