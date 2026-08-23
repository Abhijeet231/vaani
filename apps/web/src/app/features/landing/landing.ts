import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {}
