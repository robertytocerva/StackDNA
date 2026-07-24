import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

const TRANSITION_DURATION = 0.9;
const TRANSITION_EASE = 'power3.inOut';

export function initEquipoScroll(): void {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	gsap.registerPlugin(Observer);

	const fullpage = document.querySelector<HTMLElement>('[data-fullpage]');
	const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-section]'));
	if (!fullpage || sections.length === 0) return;

	let currentIndex = 0;
	let isAnimating = false;

	sections.forEach((section, index) => {
		const items = Array.from(section.querySelectorAll<HTMLElement>('[data-scroll-item]'));
		if (items.length > 0) gsap.set(items, { opacity: 0, y: 48 });
		gsap.set(section, { y: index === 0 ? 0 : '100vh', zIndex: index === 0 ? 2 : 1 });
	});

	function playSectionContent(section: HTMLElement): void {
		const items = Array.from(section.querySelectorAll<HTMLElement>('[data-scroll-item]'));
		if (items.length === 0) return;

		gsap.to(items, {
			opacity: 1,
			y: 0,
			duration: 0.8,
			ease: 'power3.out',
			stagger: 0.1,
			overwrite: true,
		});
	}

	function resetSectionContent(section: HTMLElement): void {
		const items = Array.from(section.querySelectorAll<HTMLElement>('[data-scroll-item]'));
		if (items.length === 0) return;

		gsap.to(items, { opacity: 0, y: 48, duration: 0.4, ease: 'power2.out', overwrite: true });
	}

	function parallaxMedia(section: HTMLElement, direction: 1 | -1): void {
		const media = section.querySelector<HTMLElement>('[data-scroll-media]');
		if (!media) return;

		gsap.fromTo(
			media,
			{ yPercent: direction * -8 },
			{ yPercent: 0, duration: TRANSITION_DURATION, ease: TRANSITION_EASE, overwrite: true },
		);
	}

	// Desplazamiento del 100% de la pantalla hacia la siguiente/anterior
	// sección completa, con impulso de salto (overshoot) al asentarse.
	function goToSection(targetIndex: number, direction: 1 | -1): void {
		if (isAnimating) return;
		if (targetIndex < 0 || targetIndex >= sections.length) return;

		const current = sections[currentIndex];
		const target = sections[targetIndex];

		isAnimating = true;

		gsap.set(target, { y: direction * 100 + 'vh', zIndex: 2 });
		gsap.set(current, { zIndex: 1, y: 0 });

		gsap.to(target, {
			y: 0,
			duration: TRANSITION_DURATION,
			ease: TRANSITION_EASE,
			onComplete: () => {
				isAnimating = false;
			},
		});

		resetSectionContent(current);
		playSectionContent(target);
		parallaxMedia(target, direction);

		currentIndex = targetIndex;
	}

	Observer.create({
		type: 'wheel,touch,pointer',
		wheelSpeed: 1,
		tolerance: 10,
		preventDefault: true,
		onUp: () => {
			goToSection(currentIndex - 1, -1);
		},
		onDown: () => {
			goToSection(currentIndex + 1, 1);
		},
	});

	window.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowDown' || event.key === 'PageDown') {
			event.preventDefault();
			goToSection(currentIndex + 1, 1);
		} else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
			event.preventDefault();
			goToSection(currentIndex - 1, -1);
		}
	});

	playSectionContent(sections[0]);
}
