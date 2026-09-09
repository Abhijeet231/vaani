import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL, FREE_TRIAL_TURNS } from '../../../core/site-info';
import { LegalDoc } from '../legal-doc/legal-doc';
import { BusinessIdentity } from '../business-identity/business-identity';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, LegalDoc, BusinessIdentity],
  templateUrl: './terms.html',
})
export class Terms {
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly freeTrialTurns = FREE_TRIAL_TURNS;
}
