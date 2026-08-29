import { Component } from '@angular/core';
import { CONTACT_EMAIL } from '../../contact/contact';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.html',
})
export class Privacy {
  protected readonly contactEmail = CONTACT_EMAIL;
}
