import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

const TRANSITION_DURATION = 0.9;
const TRANSITION_EASE = 'power3.inOut';
const PARALLAX_OFFSET = 8;

export function initEquipoScroll(): void {
	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	gsap.registerPlugin(Observer);

	const fullpage = document.querySelector<HTMLElement>('[data-fullpage]');
	const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-section]'));
	if (!fullpage || sections.length === 0) return;

	let currentIndex = 0;
	let isAnimating = false;

	const mediaOf = (section: HTMLElement) =>
		section.querySelector<HTMLElement>('[data-scroll-media]');

	const itemsOf = (section: HTMLElement) =>
		Array.from(section.querySelectorAll<HTMLElement>('[data-scroll-item]'));

	// Estado inicial: solo la primera seccion es visible. El resto queda fuera de
	// pantalla Y oculta (visibility), para que ninguna capa quede pintada detras.
	sections.forEach((section, index) => {
		const isFirst = index === 0;
		const items = itemsOf(section);
		if (items.length > 0) gsap.set(items, { opacity: 0, y: 48 });

		gsap.set(section, {
			y: isFirst ? 0 : '100vh',
			zIndex: isFirst ? 2 : 1,
			autoAlpha: isFirst ? 1 : 0,
		});

		const media = mediaOf(section);
		if (media) gsap.set(media, { yPercent: 0 });
	});

	function playSectionContent(section: HTMLElement): void {
		const items = itemsOf(section);
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
		const items = itemsOf(section);
		if (items.length === 0) return;

		gsap.to(items, { opacity: 0, y: 48, duration: 0.4, ease: 'power2.out', overwrite: true });
	}

	// La imagen entra con un ligero desplazamiento y se asienta en yPercent 0,
	// siempre dentro del flujo de su seccion (nunca fija respecto al viewport).
	function parallaxMedia(section: HTMLElement, direction: 1 | -1): void {
		const media = mediaOf(section);
		if (!media) return;

		gsap.fromTo(
			media,
			{ yPercent: direction * -PARALLAX_OFFSET },
			{
				yPercent: 0,
				duration: TRANSITION_DURATION,
				ease: TRANSITION_EASE,
				overwrite: true,
				onComplete: () => {
					// Se libera la promocion de capa para que el navegador no
					// conserve un frame antiguo de la foto.
					gsap.set(media, { clearProps: 'willChange' });
				},
			},
		);
	}

	// Deja la seccion saliente fuera de pantalla, oculta y con su media
	// reiniciada: asi no queda ninguna foto "pegada" al fondo.
	function parkSection(section: HTMLElement, direction: 1 | -1): void {
		gsap.set(section, { y: direction * -100 + 'vh', zIndex: 1, autoAlpha: 0 });

		const media = mediaOf(section);
		if (media) gsap.set(media, { yPercent: 0, clearProps: 'willChange' });
	}

	// Desplazamiento del 100% de la pantalla hacia la siguiente/anterior seccion.
	// Ambas secciones se animan: la entrante llega desde el borde y la saliente
	// se retira en la misma direccion, evitando que se apilen en y: 0.
	function goToSection(targetIndex: number, direction: 1 | -1): void {
		if (isAnimating) return;
		if (targetIndex < 0 || targetIndex >= sections.length) return;

		const current = sections[currentIndex];
		const target = sections[targetIndex];
		if (current === target) return;

		isAnimating = true;
		currentIndex = targetIndex;

		gsap.set(target, { y: direction * 100 + 'vh', zIndex: 2, autoAlpha: 1 });
		gsap.set(current, { y: 0, zIndex: 1, autoAlpha: 1 });

		resetSectionContent(current);
		playSectionContent(target);
		parallaxMedia(target, direction);

		const timeline = gsap.timeline({
			onComplete: () => {
				parkSection(current, direction);
				isAnimating = false;
			},
		});

		timeline
			.to(target, { y: 0, duration: TRANSITION_DURATION, ease: TRANSITION_EASE, overwrite: true }, 0)
			.to(
				current,
				{
					y: direction * -100 + 'vh',
					duration: TRANSITION_DURATION,
					ease: TRANSITION_EASE,
					overwrite: true,
				},
				0,
			);
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
