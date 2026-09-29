import { product } from '@/lib/product';

export const site = {
	name: 'ThemeForseen',
	tagline: 'Color + type preview for the web',
	unit: 'TF-01',
	unitName: 'Visual Exploration Unit',
	title: 'ThemeForseen: color and type preview for the web',
	description:
		"Explore color themes and font pairings live on the site you're building. When you find one you like, export it or apply it to your code.",
} as const;

export const station = {
	place: 'Austin, TX',
	latitude: '30.3° N',
	longitude: '97.7° W',
	version: `v${product.version}`,
} as const;

export const links = {
	product: 'https://github.com/mark-mcdermott/theme-forseen',
	docs: 'https://github.com/mark-mcdermott/theme-forseen#readme',
	install: 'https://github.com/mark-mcdermott/theme-forseen#installation',
	package: 'https://www.npmjs.com/package/theme-forseen',
	maker: 'https://mm.coffee',
} as const;

export type NavigationItem = { label: string; href: string; external?: boolean };

export const navigation: NavigationItem[] = [
	{ label: 'Forecast', href: '#conditions' },
	{ label: 'Docs', href: links.docs, external: true },
	{ label: 'Examples', href: '#examples' },
	{ label: 'GitHub', href: links.product, external: true },
	{ label: 'About', href: '/about' },
];

export const features = [
	{ icon: 'eye', title: 'Live on\nyour site', detail: 'See changes\nin real time.' },
	{ icon: 'bands', title: 'Thousands\nof themes', detail: 'Browse a large\ncollection.' },
	{ icon: 'code', title: 'Export or apply', detail: 'Copy tokens or\nupdate your code.' },
] as const;

export const steps = [
	{ title: 'Explore', detail: 'Browse a large collection\nof color themes and font pairings.' },
	{ title: 'Preview', detail: 'See changes live on your site\nin light and dark mode.' },
	{ title: 'Apply', detail: 'Copy theme tokens or write them\ndirectly to your project files.' },
] as const;
