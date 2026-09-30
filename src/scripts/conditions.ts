/**
 * The station's conditions: which palette, which faces, day or night, and
 * whether anyone is exploring.
 *
 * This is the only module that knows how ThemeForseen reports its state and
 * where it writes it. Everything else on the page watches the conditions.
 */
import type { ThemeForseenState } from 'theme-forseen';

export interface Conditions {
	palette: string;
	heading: string;
	body: string;
	mode: 'day' | 'night';
	/** The drawer is open. */
	exploring: boolean;
	/** ThemeForseen has reported in. False while the conditions are those remembered from the last visit. */
	live: boolean;
}

interface Remembered {
	/** The inline style ThemeForseen left on <html>, restored before the first paint. */
	style: string;
	conditions: Conditions;
}

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
		conditions: { ...conditions, exploring: false, live: false },
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

function report({ mode, theme, fonts, open }: ThemeForseenState): void {
	const conditions: Conditions = {
		palette: theme.name,
		heading: fonts.heading,
		body: fonts.body,
		mode: mode === 'dark' ? 'night' : 'day',
		exploring: open,
		live: true,
	};

	document.documentElement.style.setProperty('--night', conditions.mode === 'night' ? '1' : '0');
	remember(conditions);
	publish(conditions);
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

/** Begins reporting. ThemeForseen itself is fetched once the page has nothing better to do. */
export function start(): void {
	const recalled = recall();
	if (recalled) publish(recalled);

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
