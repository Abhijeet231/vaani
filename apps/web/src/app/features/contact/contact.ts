import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reveal } from '../../shared/reveal.directive';

// TODO: swap for the real contact address once confirmed (placeholder for now).
export const CONTACT_EMAIL = 'TODO@vaani.app';

@Component({
  selector: 'app-contact',
  imports: [MatButtonModule, MatIconModule, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly contactEmail = CONTACT_EMAIL;
}
