import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('vaani');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly themeClass = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.currentThemeClass()),
      startWith(this.currentThemeClass())
    ),
    { initialValue: 'theme-dark' }
  );

  private currentThemeClass(): string {
    const theme = this.route.firstChild?.snapshot.data['theme'] ?? 'dark';
    return `theme-${theme}`;
  }
}
