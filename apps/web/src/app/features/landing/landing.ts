import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import gsap from 'gsap';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatButtonModule, MatIconModule, Reveal],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  ngAfterViewInit(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    const root = this.host.nativeElement;
    const heroTitle = root.querySelector('.hero-title');
    const heroSub = root.querySelector('.hero-sub');
    const heroCta = root.querySelector('.hero-cta');
    const heroCard = root.querySelector('.hero-card');

    gsap.set([heroTitle, heroSub, heroCta, heroCard], { opacity: 0, y: 16 });

    gsap
      .timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
      .to(heroTitle, { opacity: 1, y: 0 })
      .to(heroSub, { opacity: 1, y: 0 }, '-=0.45')
      .to(heroCta, { opacity: 1, y: 0 }, '-=0.4')
      .to(heroCard, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');
  }
}
