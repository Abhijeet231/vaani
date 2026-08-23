import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, MatButtonModule, MatIconModule, Reveal],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {}
