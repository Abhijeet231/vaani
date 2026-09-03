import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL } from '../../../core/site-info';
import { LegalDoc } from '../legal-doc/legal-doc';

@Component({
  selector: 'app-shipping',
  imports: [RouterLink, LegalDoc],
  templateUrl: './shipping.html',
})
export class Shipping {
  protected readonly contactEmail = CONTACT_EMAIL;
}
