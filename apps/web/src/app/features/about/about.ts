import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  imports: [RouterLink, MatButtonModule, MatIconModule, Reveal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
