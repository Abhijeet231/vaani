import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades/slides an element in once it scrolls into view. Skipped entirely
 * under prefers-reduced-motion. Usage: `<div appReveal>...</div>`.
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private trigger?: ScrollTrigger;

  ngAfterViewInit(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    const el = this.host.nativeElement;
    gsap.set(el, { opacity: 0, y: 24 });

    this.trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }),
    });
  }

  ngOnDestroy(): void {
    this.trigger?.kill();
  }
}
