import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Revelado por scroll de la landing.
 *
 * Cada elemento marcado con `data-reveal` (o cada hijo directo de un
 * `data-reveal-group`) entra con ease out y sale con ease in, tanto al bajar
 * como al subir, de modo que aparece y desaparece siguiendo el scroll.
 *
 * Atributos soportados:
 *   data-reveal                 → elemento animado individualmente
 *   data-reveal-group           → contenedor: anima sus hijos directos en cascada
 *   data-reveal-from            → up (default) | down | left | right
 *   data-reveal-stagger         → segundos entre hijos de un grupo (default 0.09)
 */

const DURATION_IN = 0.6;
const DURATION_OUT = 0.6;
const EASE_IN = 'power3.inOut'; // entrada suave (ease in-out)
const EASE_OUT = 'power3.inOut'; // salida suave (ease in-out)
const DEFAULT_STAGGER = 0.12;
const DISTANCE = 50;

type Direction = 'up' | 'down' | 'left' | 'right';

interface RevealTarget {
	trigger: HTMLElement;
	elements: HTMLElement[];
	direction: Direction;
	stagger: number;
}

function readDirection(element: HTMLElement): Direction {
	const value = element.dataset.revealFrom;
	return value === 'down' || value === 'left' || value === 'right' ? value : 'up';
}

function hiddenState(direction: Direction) {
	switch (direction) {
		case 'down':
			return { opacity: 0, y: -DISTANCE, x: 0 };
		case 'left':
			return { opacity: 0, x: -DISTANCE, y: 0 };
		case 'right':
			return { opacity: 0, x: DISTANCE, y: 0 };
		default:
			return { opacity: 0, y: DISTANCE, x: 0 };
	}
}

/** Estado de salida: se va hacia donde el scroll lo empuja. */
function exitState(direction: Direction, sign: 1 | -1) {
	if (direction === 'left' || direction === 'right') {
		return { opacity: 0, x: direction === 'left' ? -DISTANCE * 0.5 : DISTANCE * 0.5, y: 0 };
	}
	return { opacity: 0, y: sign * DISTANCE * 0.5, x: 0 };
}

function collectTargets(root: ParentNode): RevealTarget[] {
	const targets: RevealTarget[] = [];

	root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
		const children = Array.from(group.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
		if (children.length === 0) return;

		targets.push({
			trigger: group,
			elements: children,
			direction: readDirection(group),
			stagger: Number(group.dataset.revealStagger) || DEFAULT_STAGGER,
		});
	});

	root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
		// Si ya lo anima su grupo, no se duplica.
		if (element.closest('[data-reveal-group]')) return;

		targets.push({
			trigger: element,
			elements: [element],
			direction: readDirection(element),
			stagger: 0,
		});
	});

	return targets;
}

export function initLandingScroll(): void {
	if (typeof window === 'undefined') return;

	const root = document.querySelector<HTMLElement>('[data-landing]') ?? document.body;
	const targets = collectTargets(root);
	if (targets.length === 0) return;

	// Sin animación si el usuario pide movimiento reducido: el contenido queda visible.
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	gsap.registerPlugin(ScrollTrigger);

	for (const target of targets) {
		const { trigger, elements, direction, stagger } = target;

		gsap.set(elements, { ...hiddenState(direction), willChange: 'transform, opacity' });

		const show = (fromBottom: boolean) => {
			gsap.to(elements, {
				opacity: 1,
				x: 0,
				y: 0,
				duration: DURATION_IN,
				ease: EASE_IN,
				stagger: stagger ? (fromBottom ? stagger : stagger * 0.7) : 0,
				overwrite: 'auto',
			});
		};

		const hide = (sign: 1 | -1) => {
			gsap.to(elements, {
				...exitState(direction, sign),
				duration: DURATION_OUT,
				ease: EASE_OUT,
				stagger: stagger ? stagger * 0.5 : 0,
				overwrite: 'auto',
			});
		};

		ScrollTrigger.create({
			trigger,
			start: 'top 88%',
			end: 'bottom 12%',
			onEnter: () => show(true),
			onEnterBack: () => show(false),
			onLeave: () => hide(-1),
			onLeaveBack: () => hide(1),
		});

		// Lo que ya está en pantalla al cargar entra de inmediato.
		const rect = trigger.getBoundingClientRect();
		if (rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12) {
			show(true);
		}
	}

	ScrollTrigger.refresh();
}
