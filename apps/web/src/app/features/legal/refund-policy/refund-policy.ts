import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL } from '../../contact/contact';

@Component({
  selector: 'app-refund-policy',
  imports: [RouterLink],
  templateUrl: './refund-policy.html',
})
export class RefundPolicy {
  protected readonly contactEmail = CONTACT_EMAIL;
}
