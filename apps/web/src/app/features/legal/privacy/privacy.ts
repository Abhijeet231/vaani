import { Component } from '@angular/core';
import { CONTACT_EMAIL } from '../../../core/site-info';
import { LegalDoc } from '../legal-doc/legal-doc';
import { BusinessIdentity } from '../business-identity/business-identity';

@Component({
  selector: 'app-privacy',
  imports: [LegalDoc, BusinessIdentity],
  templateUrl: './privacy.html',
})
export class Privacy {
  protected readonly contactEmail = CONTACT_EMAIL;
}
