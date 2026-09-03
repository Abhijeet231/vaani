import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reveal } from '../../shared/reveal.directive';
import { BusinessIdentity } from '../legal/business-identity/business-identity';
import { CONTACT_EMAIL } from '../../core/site-info';

// Re-exported for the handful of legacy imports that point here; the canonical
// home is core/site-info.ts.
export { CONTACT_EMAIL } from '../../core/site-info';

@Component({
  selector: 'app-contact',
  imports: [MatButtonModule, MatIconModule, Reveal, BusinessIdentity],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly contactEmail = CONTACT_EMAIL;
}
