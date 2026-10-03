/**
 * The station's conditions: which palette, which faces, day or night, and
 * whether anyone is exploring.
 *
 * This is the only module that knows how ThemeForseen reports its state and
 * where it writes it. Everything else on the page watches the conditions.
 */
import type { ThemeForseenState } from 'theme-forseen';

import { derivedProperties } from '@/lib/derived';

export interface Conditions {
	palette: string;
	heading: string;
	body: string;
	mode: 'day' | 'night';
	/** The drawer is open. */
	exploring: boolean;
	/** The selection is off the page for a moment, to compare with the station as it left the factory. */
	comparing: boolean;
	/** ThemeForseen has reported in. False while the conditions are those remembered from the last visit. */
	live: boolean;
}

interface Remembered {
	/** The inline style ThemeForseen left on <html>, restored before the first paint. */
	style: string;
	conditions: Conditions;
}

/** The width of the bay's cavity in the reference, in its pixels. */
const BAY_WIDTH = 450;

export const CONDITIONS_KEY = 'tf01-conditions';
export const CONDITIONS_EVENT = 'conditions:change';

let current: Conditions | null = null;
let widget: Promise<HTMLElementTagNameMap['theme-forseen']> | null = null;

/** Day or night as the page stands, which is known before ThemeForseen has said anything. */
export function currentMode(): Conditions['mode'] {
	const night = getComputedStyle(document.documentElement).getPropertyValue('--night').trim();
	return night === '1' ? 'night' : 'day';
}

function publish(conditions: Conditions): void {
	current = conditions;
	document.dispatchEvent(new CustomEvent<Conditions>(CONDITIONS_EVENT, { detail: conditions }));
}

function remember(conditions: Conditions): void {
	const remembered: Remembered = {
		style: document.documentElement.style.cssText,
		conditions: { ...conditions, exploring: false, comparing: false, live: false },
	};

	try {
		localStorage.setItem(CONDITIONS_KEY, JSON.stringify(remembered));
	} catch (error) {
		console.warn('The conditions could not be remembered for the next visit.', error);
	}
}

function recall(): Conditions | null {
	try {
		const remembered = JSON.parse(localStorage.getItem(CONDITIONS_KEY) ?? 'null') as Remembered | null;
		return remembered?.conditions ?? null;
	} catch (error) {
		console.warn('The remembered conditions could not be read.', error);
		return null;
	}
}

function report({ mode, theme, fonts, open, previewing }: ThemeForseenState): void {
	const root = document.documentElement.style;
	const derived = derivedProperties(theme.colors);

	if (!previewing) {
		compare(Object.keys(derived), open);
		return;
	}

	const conditions: Conditions = {
		palette: theme.name,
		heading: fonts.heading,
		body: fonts.body,
		mode: mode === 'dark' ? 'night' : 'day',
		exploring: open,
		comparing: false,
		live: true,
	};

	root.setProperty('--night', conditions.mode === 'night' ? '1' : '0');
	for (const [property, value] of Object.entries(derived)) root.setProperty(property, value);

	remember(conditions);
	publish(conditions);
}

/**
 * The drawer has taken the selection off the page to compare. What the station
 * derives from the selection comes off with it, leaving the station as it left
 * the factory, and that is what it reports. Nothing is remembered: the next
 * visit starts from the selection.
 */
function compare(derived: string[], open: boolean): void {
	const root = document.documentElement.style;
	root.removeProperty('--night');
	for (const property of derived) root.removeProperty(property);

	const element = document.querySelector('theme-forseen');
	const [heading = '', body = ''] = (element?.getAttribute('default-fonts') ?? '').split(' & ');

	publish({
		palette: element?.getAttribute('default-theme') ?? '',
		heading,
		body,
		mode: currentMode(),
		exploring: open,
		comparing: true,
		live: true,
	});
}

function loadWidget(): Promise<HTMLElementTagNameMap['theme-forseen']> {
	widget ??= import('theme-forseen').then(() => {
		const element = document.querySelector('theme-forseen');
		if (!element) throw new Error('The page has no <theme-forseen> element.');
		return element;
	});

	return widget;
}

function whenIdle(task: () => void): void {
	const schedule = () => ('requestIdleCallback' in window ? requestIdleCallback(task, { timeout: 3000 }) : setTimeout(task, 200));

	if (document.readyState === 'complete') schedule();
	else window.addEventListener('load', schedule, { once: true });
}

function reportFailure(error: unknown): void {
	console.error('ThemeForseen could not be loaded.', error);
}

/**
 * At the console's width the drawer has a bay and sits in it, deployed. Below
 * that, and on a page without a bay, it sits in its own housing, which slides
 * in from the side of the window. It is docked in either, drawn for the bay's
 * width and zoomed to the one it is in.
 */
function seatDrawer(): void {
	const housing = document.querySelector<HTMLElement>('[data-drawer-housing]');
	const housingCavity = housing?.querySelector<HTMLElement>('[data-drawer-housing-cavity]');
	const element = housingCavity?.querySelector<HTMLElement>('theme-forseen');
	if (!housing || !housingCavity || !element) return;

	const bay = document.querySelector<HTMLElement>('[data-drawer-bay]');
	const hasBay = window.matchMedia('(min-width: 1280px)');
	const seat = () => (bay && hasBay.matches ? bay : housingCavity);

	const fit = () => {
		element.style.zoom = String(seat().clientWidth / BAY_WIDTH);
	};

	const place = () => {
		const cavity = seat();
		const inBay = cavity === bay;
		if (element.parentElement !== cavity) cavity.append(element);
		housing.dataset.seated = inBay ? 'bay' : 'housing';
		element.toggleAttribute('open', inBay);
		fit();
	};

	element.toggleAttribute('docked', true);
	place();
	hasBay.addEventListener('change', place);
	const resized = new ResizeObserver(fit);
	resized.observe(housingCavity);
	if (bay) resized.observe(bay);
}

/** Begins reporting. ThemeForseen itself is fetched once the page has nothing better to do. */
export function start(): void {
	const recalled = recall();
	if (recalled) publish(recalled);

	seatDrawer();

	document.addEventListener('themeforseen:change', (event) => report(event.detail));
	whenIdle(() => loadWidget().catch(reportFailure));
}

/** Calls `watcher` with the conditions as they are now, if they are known, and whenever they change. */
export function watchConditions(watcher: (conditions: Conditions) => void): void {
	document.addEventListener(CONDITIONS_EVENT, (event) => watcher((event as CustomEvent<Conditions>).detail));
	if (current) watcher(current);
}

export function setMode(mode: Conditions['mode']): void {
	loadWidget()
		.then(() => window.dispatchEvent(new CustomEvent('darkmode-change', { detail: { dark: mode === 'night' } })))
		.catch(reportFailure);
}

export function openDrawer(): void {
	loadWidget()
		.then((element) => element.open())
		.catch(reportFailure);
}

export function setDrawer(deployed: boolean): void {
	loadWidget()
		.then((element) => (deployed ? element.open() : element.close()))
		.catch(reportFailure);
}
