import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth.service';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    Footer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('vaani');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly isAuthed = computed(() => this.auth.ready() && !!this.auth.user());
  protected readonly userLabel = computed(() => {
    const user = this.auth.user();
    return user?.displayName || user?.email || 'Account';
  });
  protected readonly userPhoto = computed(() => this.auth.user()?.photoURL ?? null);
  // Google's photoURL occasionally 429s/fails to load — fall back to the icon rather than a broken image.
  protected readonly photoFailed = signal(false);

  async logOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/');
  }

  protected readonly themeClass = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.currentThemeClass()),
      startWith(this.currentThemeClass())
    ),
    { initialValue: 'theme-dark' }
  );

  // Landing owns its own nav (a scroll-morphing pill matching the "Vaani Hero"
  // design) instead of the shared toolbar every other route uses.
  protected readonly hideChrome = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.currentHideChrome()),
      startWith(this.currentHideChrome())
    ),
    { initialValue: false }
  );

  // Most routes keep the shared footer even when hideChrome is true (the landing
  // page does). The waitlist page is the exception — it stands entirely alone.
  protected readonly hideFooter = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.currentHideFooter()),
      startWith(this.currentHideFooter())
    ),
    { initialValue: false }
  );

  private currentThemeClass(): string {
    const theme = this.route.firstChild?.snapshot.data['theme'] ?? 'dark';
    return `theme-${theme}`;
  }

  private currentHideChrome(): boolean {
    return this.route.firstChild?.snapshot.data['hideChrome'] ?? false;
  }

  private currentHideFooter(): boolean {
    return this.route.firstChild?.snapshot.data['hideFooter'] ?? false;
  }
}
