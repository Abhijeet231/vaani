import dns from 'node:dns';
import { Agent, fetch as undiciFetch } from 'undici';
import { neonConfig } from '@neondatabase/serverless';

// This machine's ISP DNS resolver refuses to answer for Neon's hostnames
// ("Query refused") while resolving everything else fine, including
// neon.tech itself — confirmed a public resolver (8.8.8.8) answers correctly.
// Node's built-in global `fetch` resolves hostnames via an internal
// implementation that isn't reachable by patching the public `dns.lookup`
// export, so instead: give the Neon client its own fetch (via `undici`,
// which *does* forward a custom socket-level `lookup` down to `tls.connect`)
// that resolves *.neon.tech through a public resolver and leaves every other
// hostname on the normal OS resolver.
const publicResolver = new dns.promises.Resolver();
publicResolver.setServers(['8.8.8.8', '1.1.1.1']);

type LookupCallback = (err: NodeJS.ErrnoException | null, address?: string, family?: number) => void;

function lookup(hostname: string, options: unknown, callback: unknown): void {
  const cb = (typeof options === 'function' ? options : callback) as LookupCallback;
  // Node's net/tls internals always call with { all: true, ... } — expects
  // (err, [{ address, family }, ...]) back, not the single-address (err, address, family)
  // shape the public dns.lookup callback API documents for direct callers.
  const wantsAll = typeof options === 'object' && options !== null && (options as { all?: boolean }).all === true;

  if (!hostname.endsWith('.neon.tech')) {
    // @ts-expect-error — forwarding whatever (options, callback) shape Node passed through
    dns.lookup(hostname, options, callback);
    return;
  }

  publicResolver
    .resolve4(hostname)
    .then((addresses) => {
      if (wantsAll) {
        (cb as unknown as (err: null, addrs: { address: string; family: number }[]) => void)(
          null,
          addresses.map((address) => ({ address, family: 4 }))
        );
      } else {
        cb(null, addresses[0], 4);
      }
    })
    .catch((err) => cb(err as NodeJS.ErrnoException));
}

const neonAgent = new Agent({ connect: { lookup } });

neonConfig.fetchFunction = (url: string, init?: RequestInit) =>
  undiciFetch(url, { ...init, dispatcher: neonAgent } as never);
