// Font sources configuration
// All fonts listed are free for commercial use under OFL or similar licenses

export type FontSource = 'google' | 'fontsource' | 'fontshare' | 'fontsquirrel';

export interface Font {
	name: string;
	family: string; // CSS font-family value
	source: FontSource;
	category: 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';
	weights: number[];
	variable?: boolean; // Is it a variable font?
}

export interface FontPairingExtended {
	name: string;
	heading: Font;
	body: Font;
	tags?: string[];
}

// Fontsource fonts - loaded via CDN: https://cdn.jsdelivr.net/fontsource/fonts/[id]/
// These are the most popular Fontsource fonts
export const fontsourceFonts: Font[] = [
	// Sans-serif
	{ name: 'Inter', family: 'Inter', source: 'fontsource', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Geist Sans', family: 'Geist Sans', source: 'fontsource', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Nunito', family: 'Nunito', source: 'fontsource', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Rubik', family: 'Rubik', source: 'fontsource', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Outfit', family: 'Outfit', source: 'fontsource', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans', source: 'fontsource', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800], variable: true },
	{ name: 'DM Sans', family: 'DM Sans', source: 'fontsource', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Figtree', family: 'Figtree', source: 'fontsource', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Onest', family: 'Onest', source: 'fontsource', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Bricolage Grotesque', family: 'Bricolage Grotesque', source: 'fontsource', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800], variable: true },

	// Serif
	{ name: 'Crimson Pro', family: 'Crimson Pro', source: 'fontsource', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Fraunces', family: 'Fraunces', source: 'fontsource', category: 'serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Newsreader', family: 'Newsreader', source: 'fontsource', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800], variable: true },
	{ name: 'Literata', family: 'Literata', source: 'fontsource', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Source Serif 4', family: 'Source Serif 4', source: 'fontsource', category: 'serif', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },

	// Display
	{ name: 'Space Grotesk', family: 'Space Grotesk', source: 'fontsource', category: 'display', weights: [300, 400, 500, 600, 700], variable: true },
	{ name: 'Unbounded', family: 'Unbounded', source: 'fontsource', category: 'display', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Instrument Sans', family: 'Instrument Sans', source: 'fontsource', category: 'display', weights: [400, 500, 600, 700], variable: true },

	// Monospace
	{ name: 'Geist Mono', family: 'Geist Mono', source: 'fontsource', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'JetBrains Mono', family: 'JetBrains Mono', source: 'fontsource', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800], variable: true },
	{ name: 'Fira Code', family: 'Fira Code', source: 'fontsource', category: 'monospace', weights: [300, 400, 500, 600, 700], variable: true },
	{ name: 'Source Code Pro', family: 'Source Code Pro', source: 'fontsource', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
];

// Fontshare fonts - loaded via: https://api.fontshare.com/v2/css?f[]=family@weights
// All 100% free for commercial use
export const fontshareFonts: Font[] = [
	// Sans-serif
	{ name: 'Satoshi', family: 'Satoshi', source: 'fontshare', category: 'sans-serif', weights: [300, 400, 500, 700, 900], variable: true },
	{ name: 'General Sans', family: 'General Sans', source: 'fontshare', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Cabinet Grotesk', family: 'Cabinet Grotesk', source: 'fontshare', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 700, 800], variable: true },
	{ name: 'Switzer', family: 'Switzer', source: 'fontshare', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Synonym', family: 'Synonym', source: 'fontshare', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Chillax', family: 'Chillax', source: 'fontshare', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Clash Grotesk', family: 'Clash Grotesk', source: 'fontshare', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Zodiak', family: 'Zodiak', source: 'fontshare', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800], variable: true },

	// Serif
	{ name: 'Boska', family: 'Boska', source: 'fontshare', category: 'serif', weights: [200, 300, 400, 500, 700], variable: true },
	{ name: 'Erode', family: 'Erode', source: 'fontshare', category: 'serif', weights: [300, 400, 500, 600, 700], variable: true },
	{ name: 'Sentient', family: 'Sentient', source: 'fontshare', category: 'serif', weights: [300, 400, 500, 600, 700], variable: true },
	{ name: 'Bespoke Serif', family: 'Bespoke Serif', source: 'fontshare', category: 'serif', weights: [300, 400, 500, 600, 700, 800], variable: true },
	{ name: 'Author', family: 'Author', source: 'fontshare', category: 'serif', weights: [200, 300, 400, 500, 600, 700], variable: true },

	// Display
	{ name: 'Clash Display', family: 'Clash Display', source: 'fontshare', category: 'display', weights: [200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Supreme', family: 'Supreme', source: 'fontshare', category: 'display', weights: [100, 200, 300, 400, 500, 700, 800], variable: true },
	{ name: 'Ranade', family: 'Ranade', source: 'fontshare', category: 'display', weights: [100, 200, 300, 400, 500, 600, 700], variable: true },
	{ name: 'Nippo', family: 'Nippo', source: 'fontshare', category: 'display', weights: [200, 300, 400, 500, 700], variable: true },
	{ name: 'Technor', family: 'Technor', source: 'fontshare', category: 'display', weights: [200, 300, 400, 500, 600, 700, 800], variable: true },

	// Monospace
	{ name: 'Jet Brains Mono', family: 'Jet Brains Mono', source: 'fontshare', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800], variable: false },
];

// Font Squirrel fonts - loaded via self-hosted @font-face
// All verified 100% free for commercial use
export const fontSquirrelFonts: Font[] = [
	// Sans-serif
	{ name: 'League Spartan', family: 'League Spartan', source: 'fontsquirrel', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: true },
	{ name: 'Aileron', family: 'Aileron', source: 'fontsquirrel', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], variable: false },
	{ name: 'Nexa', family: 'Nexa', source: 'fontsquirrel', category: 'sans-serif', weights: [100, 300, 400, 700, 900], variable: false },
	{ name: 'Code Pro', family: 'Code Pro', source: 'fontsquirrel', category: 'sans-serif', weights: [300, 400, 700], variable: false },
	{ name: 'Gidole', family: 'Gidole', source: 'fontsquirrel', category: 'sans-serif', weights: [400], variable: false },
	{ name: 'Hind', family: 'Hind', source: 'fontsquirrel', category: 'sans-serif', weights: [300, 400, 500, 600, 700], variable: false },

	// Serif
	{ name: 'Libre Baskerville', family: 'Libre Baskerville', source: 'fontsquirrel', category: 'serif', weights: [400, 700], variable: false },
	{ name: 'Quattrocento', family: 'Quattrocento', source: 'fontsquirrel', category: 'serif', weights: [400, 700], variable: false },
	{ name: 'Cardo', family: 'Cardo', source: 'fontsquirrel', category: 'serif', weights: [400, 700], variable: false },
	{ name: 'Lora', family: 'Lora', source: 'fontsquirrel', category: 'serif', weights: [400, 500, 600, 700], variable: true },

	// Display
	{ name: 'League Gothic', family: 'League Gothic', source: 'fontsquirrel', category: 'display', weights: [400], variable: false },
	{ name: 'Ostrich Sans', family: 'Ostrich Sans', source: 'fontsquirrel', category: 'display', weights: [300, 400, 500, 700, 900], variable: false },
	{ name: 'Bebas Neue', family: 'Bebas Neue', source: 'fontsquirrel', category: 'display', weights: [400], variable: false },
	{ name: 'Chunk Five', family: 'Chunk Five', source: 'fontsquirrel', category: 'display', weights: [400], variable: false },

	// Monospace
	{ name: 'Anonymous Pro', family: 'Anonymous Pro', source: 'fontsquirrel', category: 'monospace', weights: [400, 700], variable: false },
	{ name: 'Inconsolata', family: 'Inconsolata', source: 'fontsquirrel', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 800, 900], variable: true },
];

// All fonts combined
export const allFonts: Font[] = [
	...fontsourceFonts,
	...fontshareFonts,
	...fontSquirrelFonts,
];

// Font pairings using the new sources
export const extendedFontPairings: FontPairingExtended[] = [
	// Fontsource pairings
	{
		name: 'Inter & Geist Sans',
		heading: fontsourceFonts.find(f => f.name === 'Inter')!,
		body: fontsourceFonts.find(f => f.name === 'Geist Sans')!,
		tags: ['modern', 'clean', 'tech'],
	},
	{
		name: 'Space Grotesk & DM Sans',
		heading: fontsourceFonts.find(f => f.name === 'Space Grotesk')!,
		body: fontsourceFonts.find(f => f.name === 'DM Sans')!,
		tags: ['modern', 'geometric'],
	},
	{
		name: 'Fraunces & Outfit',
		heading: fontsourceFonts.find(f => f.name === 'Fraunces')!,
		body: fontsourceFonts.find(f => f.name === 'Outfit')!,
		tags: ['elegant', 'contrast'],
	},
	{
		name: 'Bricolage Grotesque & Inter',
		heading: fontsourceFonts.find(f => f.name === 'Bricolage Grotesque')!,
		body: fontsourceFonts.find(f => f.name === 'Inter')!,
		tags: ['quirky', 'modern'],
	},
	{
		name: 'JetBrains Mono & Figtree',
		heading: fontsourceFonts.find(f => f.name === 'JetBrains Mono')!,
		body: fontsourceFonts.find(f => f.name === 'Figtree')!,
		tags: ['code', 'tech'],
	},

	// Fontshare pairings
	{
		name: 'Satoshi & General Sans',
		heading: fontshareFonts.find(f => f.name === 'Satoshi')!,
		body: fontshareFonts.find(f => f.name === 'General Sans')!,
		tags: ['modern', 'startup'],
	},
	{
		name: 'Clash Display & Switzer',
		heading: fontshareFonts.find(f => f.name === 'Clash Display')!,
		body: fontshareFonts.find(f => f.name === 'Switzer')!,
		tags: ['bold', 'impactful'],
	},
	{
		name: 'Cabinet Grotesk & Synonym',
		heading: fontshareFonts.find(f => f.name === 'Cabinet Grotesk')!,
		body: fontshareFonts.find(f => f.name === 'Synonym')!,
		tags: ['clean', 'minimal'],
	},
	{
		name: 'Boska & Chillax',
		heading: fontshareFonts.find(f => f.name === 'Boska')!,
		body: fontshareFonts.find(f => f.name === 'Chillax')!,
		tags: ['editorial', 'elegant'],
	},
	{
		name: 'Supreme & Satoshi',
		heading: fontshareFonts.find(f => f.name === 'Supreme')!,
		body: fontshareFonts.find(f => f.name === 'Satoshi')!,
		tags: ['luxury', 'modern'],
	},
	{
		name: 'Technor & General Sans',
		heading: fontshareFonts.find(f => f.name === 'Technor')!,
		body: fontshareFonts.find(f => f.name === 'General Sans')!,
		tags: ['tech', 'futuristic'],
	},
	{
		name: 'Erode & Switzer',
		heading: fontshareFonts.find(f => f.name === 'Erode')!,
		body: fontshareFonts.find(f => f.name === 'Switzer')!,
		tags: ['editorial', 'contrast'],
	},

	// Font Squirrel pairings
	{
		name: 'League Gothic & League Spartan',
		heading: fontSquirrelFonts.find(f => f.name === 'League Gothic')!,
		body: fontSquirrelFonts.find(f => f.name === 'League Spartan')!,
		tags: ['bold', 'impactful'],
	},
	{
		name: 'Bebas Neue & Hind',
		heading: fontSquirrelFonts.find(f => f.name === 'Bebas Neue')!,
		body: fontSquirrelFonts.find(f => f.name === 'Hind')!,
		tags: ['headlines', 'modern'],
	},
	{
		name: 'Libre Baskerville & Aileron',
		heading: fontSquirrelFonts.find(f => f.name === 'Libre Baskerville')!,
		body: fontSquirrelFonts.find(f => f.name === 'Aileron')!,
		tags: ['classic', 'editorial'],
	},
	{
		name: 'Chunk Five & Gidole',
		heading: fontSquirrelFonts.find(f => f.name === 'Chunk Five')!,
		body: fontSquirrelFonts.find(f => f.name === 'Gidole')!,
		tags: ['retro', 'bold'],
	},

	// Cross-source pairings
	{
		name: 'Clash Display & Inter',
		heading: fontshareFonts.find(f => f.name === 'Clash Display')!,
		body: fontsourceFonts.find(f => f.name === 'Inter')!,
		tags: ['bold', 'clean'],
	},
	{
		name: 'Satoshi & Geist Sans',
		heading: fontshareFonts.find(f => f.name === 'Satoshi')!,
		body: fontsourceFonts.find(f => f.name === 'Geist Sans')!,
		tags: ['modern', 'tech'],
	},
	{
		name: 'Fraunces & Satoshi',
		heading: fontsourceFonts.find(f => f.name === 'Fraunces')!,
		body: fontshareFonts.find(f => f.name === 'Satoshi')!,
		tags: ['elegant', 'modern'],
	},
];

// Helper function to get CSS URL for loading a font
export function getFontLoadUrl(font: Font, weights: number[] = [400, 700]): string {
	const weightString = weights.join(';');

	switch (font.source) {
		case 'fontsource':
			// Fontsource CDN format via npm
			const fontId = font.name.toLowerCase().replace(/ /g, '-');
			return `https://cdn.jsdelivr.net/npm/@fontsource/${fontId}@latest/index.css`;

		case 'fontshare':
			// Fontshare CSS format
			const fontshareId = font.name.toLowerCase().replace(/ /g, '-');
			return `https://api.fontshare.com/v2/css?f[]=${fontshareId}@${weightString}&display=swap`;

		case 'fontsquirrel':
			// Font Squirrel requires self-hosting - return a placeholder
			// In production, you'd host these yourself or use a CDN
			return `https://fonts.cdnfonts.com/css/${font.name.toLowerCase().replace(/ /g, '-')}`;

		default:
			return '';
	}
}

// Generate CSS @import or <link> for a font
export function getFontCSSLink(font: Font, weights: number[] = [400, 500, 600, 700]): string {
	switch (font.source) {
		case 'fontsource': {
			const fontId = font.name.toLowerCase().replace(/ /g, '-');
			return `https://cdn.jsdelivr.net/npm/@fontsource/${fontId}@latest/index.css`;
		}
		case 'fontshare': {
			const fontshareId = font.name.toLowerCase().replace(/ /g, '-');
			const weightList = weights.join(',');
			return `https://api.fontshare.com/v2/css?f[]=${fontshareId}@${weightList}&display=swap`;
		}
		case 'fontsquirrel': {
			const squirrelId = font.name.toLowerCase().replace(/ /g, '-');
			return `https://fonts.cdnfonts.com/css/${squirrelId}`;
		}
		default:
			return '';
	}
}

// Source display info
export const fontSourceInfo: Record<FontSource, { name: string; description: string; url: string }> = {
	google: {
		name: 'Google Fonts',
		description: 'Free, open-source fonts from Google',
		url: 'https://fonts.google.com',
	},
	fontsource: {
		name: 'Fontsource',
		description: 'Self-hostable open-source fonts via NPM',
		url: 'https://fontsource.org',
	},
	fontshare: {
		name: 'Fontshare',
		description: 'Free professional fonts from Indian Type Foundry',
		url: 'https://fontshare.com',
	},
	fontsquirrel: {
		name: 'Font Squirrel',
		description: 'Hand-picked free fonts for commercial use',
		url: 'https://fontsquirrel.com',
	},
};
