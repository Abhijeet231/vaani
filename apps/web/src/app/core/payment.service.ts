import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

// Minimal shape of what we actually use from Razorpay's checkout.js global —
// the full SDK has no first-party types, this is just enough to call it.
interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  packLabel: string;
}

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private scriptLoaded: Promise<void> | null = null;

  private loadCheckoutScript(): Promise<void> {
    if (!this.scriptLoaded) {
      this.scriptLoaded = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CHECKOUT_SCRIPT_URL;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
        document.head.appendChild(script);
      });
    }
    return this.scriptLoaded;
  }

  // Opens Razorpay's hosted checkout for a pack. Resolves with the new
  // balance on success, or throws (cancelled by the user, or verify failed).
  async buyPack(packId: string): Promise<number> {
    await this.loadCheckoutScript();
    if (!window.Razorpay) {
      throw new Error('Razorpay checkout is unavailable right now.');
    }

    const order = await firstValueFrom(
      this.http.post<CheckoutResponse>('/api/payments/checkout', { packId })
    );

    return new Promise<number>((resolve, reject) => {
      const razorpay = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'vaani',
        description: `${order.packLabel} recharge pack`,
        order_id: order.orderId,
        theme: { color: '#92A9E1' },
        modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
        handler: (response) => {
          firstValueFrom(this.http.post<{ turnsBalance: number }>('/api/payments/verify', response))
            .then((result) => {
              const user = this.auth.dbUser();
              if (user) this.auth.dbUser.set({ ...user, turnsBalance: result.turnsBalance });
              resolve(result.turnsBalance);
            })
            .catch(reject);
        },
      });
      razorpay.open();
    });
  }
}
