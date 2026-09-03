import { Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Shared shell for the legal pages (privacy / terms / refund / shipping):
 * a consistent title block, a "last updated" line, a pill nav that cross-links
 * the four documents, and typographic styling for the projected `<section>` /
 * `<h2>` / `<p>` / `<ul>` content so each page only writes the prose.
 *
 * ViewEncapsulation.None so the `.legal-doc__body` typography reaches the
 * projected content — every selector is scoped under `.legal-doc`, same
 * approach the landing page uses.
 */
@Component({
  selector: 'app-legal-doc',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './legal-doc.html',
  styleUrl: './legal-doc.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LegalDoc {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly updated = input('2026-09-03');

  protected readonly links = [
    { path: '/privacy', label: 'Privacy' },
    { path: '/terms', label: 'Terms' },
    { path: '/refund-policy', label: 'Refunds' },
    { path: '/shipping', label: 'Shipping & Delivery' },
  ];
}
