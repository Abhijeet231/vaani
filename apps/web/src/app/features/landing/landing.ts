import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly scrollTriggers: ScrollTrigger[] = [];

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
    const revealTargets = root.querySelectorAll<HTMLElement>('.reveal');

    gsap.set([heroTitle, heroSub, heroCta, heroCard], { opacity: 0, y: 16 });
    gsap.set(revealTargets, { opacity: 0, y: 24 });

    gsap
      .timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
      .to(heroTitle, { opacity: 1, y: 0 })
      .to(heroSub, { opacity: 1, y: 0 }, '-=0.45')
      .to(heroCta, { opacity: 1, y: 0 }, '-=0.4')
      .to(heroCard, { opacity: 1, y: 0, duration: 0.8 }, '-=0.5');

    revealTargets.forEach((target) => {
      this.scrollTriggers.push(
        ScrollTrigger.create({
          trigger: target,
          start: 'top 85%',
          once: true,
          onEnter: () => gsap.to(target, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }),
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.scrollTriggers.forEach((trigger) => trigger.kill());
  }
}
