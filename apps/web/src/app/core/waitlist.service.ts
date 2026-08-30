import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface WaitlistResponse {
  ok: true;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly http = inject(HttpClient);

  // Posts an email (or phone) to the public waitlist endpoint. Resolves with
  // the caller's queue position; throws on a validation/network error.
  join(payload: { email?: string; phone?: string }): Promise<WaitlistResponse> {
    return firstValueFrom(this.http.post<WaitlistResponse>('/api/waitlist', payload));
  }
}
