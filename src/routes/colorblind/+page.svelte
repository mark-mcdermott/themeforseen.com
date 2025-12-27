<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Eye, ChevronDown, Sun, Moon } from 'lucide-svelte';
	import { colorThemes } from '$lib/themes';

	let { data } = $props();

	// State
	let selectedPalette = $state<string>(colorThemes[0]?.name || '');
	let previewMode = $state<'light' | 'dark'>('light');
	let selectedSimulation = $state<string>('normal');

	// Color blindness types with descriptions
	const simulations = [
		{ id: 'normal', name: 'Normal Vision', description: 'Full color perception', prevalence: '~92%' },
		{ id: 'protanopia', name: 'Protanopia', description: 'Red-blind (no red cones)', prevalence: '~1% of males' },
		{ id: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind (no green cones)', prevalence: '~1% of males' },
		{ id: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind (no blue cones)', prevalence: '~0.01%' },
		{ id: 'protanomaly', name: 'Protanomaly', description: 'Red-weak (reduced red sensitivity)', prevalence: '~1% of males' },
		{ id: 'deuteranomaly', name: 'Deuteranomaly', description: 'Green-weak (reduced green sensitivity)', prevalence: '~5% of males' },
		{ id: 'tritanomaly', name: 'Tritanomaly', description: 'Blue-weak (reduced blue sensitivity)', prevalence: '~0.01%' },
		{ id: 'achromatopsia', name: 'Achromatopsia', description: 'Complete color blindness (grayscale)', prevalence: '~0.003%' }
	];

	// Find current theme
	const currentTheme = $derived(() => {
		const builtIn = colorThemes.find((t) => t.name === selectedPalette);
		if (builtIn) return builtIn;

		const custom = data.userPalettes.find((p) => p.name === selectedPalette);
		if (custom) {
			return {
				name: custom.name,
				light: custom.light as typeof colorThemes[0]['light'],
				dark: custom.dark as typeof colorThemes[0]['dark']
			};
		}

		return colorThemes[0];
	});

	const colors = $derived(() => {
		const theme = currentTheme();
		return theme ? (previewMode === 'light' ? theme.light : theme.dark) : null;
	});

	// Color blindness simulation matrices
	// Based on research by Brettel, Viénot, and Mollon
	const matrices: Record<string, number[][]> = {
		normal: [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		],
		protanopia: [
			[0.567, 0.433, 0],
			[0.558, 0.442, 0],
			[0, 0.242, 0.758]
		],
		deuteranopia: [
			[0.625, 0.375, 0],
			[0.7, 0.3, 0],
			[0, 0.3, 0.7]
		],
		tritanopia: [
			[0.95, 0.05, 0],
			[0, 0.433, 0.567],
			[0, 0.475, 0.525]
		],
		protanomaly: [
			[0.817, 0.183, 0],
			[0.333, 0.667, 0],
			[0, 0.125, 0.875]
		],
		deuteranomaly: [
			[0.8, 0.2, 0],
			[0.258, 0.742, 0],
			[0, 0.142, 0.858]
		],
		tritanomaly: [
			[0.967, 0.033, 0],
			[0, 0.733, 0.267],
			[0, 0.183, 0.817]
		],
		achromatopsia: [
			[0.299, 0.587, 0.114],
			[0.299, 0.587, 0.114],
			[0.299, 0.587, 0.114]
		]
	};

	function hexToRgb(hex: string): [number, number, number] {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
			: [0, 0, 0];
	}

	function rgbToHex(r: number, g: number, b: number): string {
		const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
		return '#' + [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
	}

	function simulateColorBlindness(hex: string, type: string): string {
		const [r, g, b] = hexToRgb(hex);
		const matrix = matrices[type] || matrices.normal;

		const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b;
		const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b;
		const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b;

		return rgbToHex(newR, newG, newB);
	}

	// Get all palette colors with labels
	const paletteColors = $derived(() => {
		const c = colors();
		if (!c) return [];

		return [
			{ key: 'background', label: 'Background', color: c.background },
			{ key: 'cardBackground', label: 'Card Background', color: c.cardBackground },
			{ key: 'text', label: 'Text', color: c.text },
			{ key: 'primary', label: 'Primary', color: c.primary },
			{ key: 'accent', label: 'Accent', color: c.accent }
		];
	});

	// Simulated colors
	const simulatedColors = $derived(() => {
		return paletteColors().map((item) => ({
			...item,
			simulated: simulateColorBlindness(item.color, selectedSimulation)
		}));
	});

	// Current simulation info
	const currentSimulation = $derived(() => {
		return simulations.find((s) => s.id === selectedSimulation) || simulations[0];
	});
</script>

<svelte:head>
	<title>Color Blindness Simulator - ThemeForseen</title>
	<meta name="description" content="See how your color palette appears to people with color vision deficiency" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Eye class="w-8 h-8" />
			Color Blindness Simulator
		</h1>
		<p class="text-muted-foreground mt-2">
			Preview how your color palette appears to people with different types of color vision deficiency
		</p>
	</div>

	<!-- Controls -->
	<div class="flex flex-wrap gap-4 mb-8">
		<div class="flex-1 min-w-[200px]">
			<label for="palette-select" class="text-sm font-medium text-muted-foreground mb-1 block">Palette</label>
			<div class="select-wrapper">
				<select id="palette-select" bind:value={selectedPalette} class="w-full">
					<optgroup label="Built-in Palettes">
						{#each colorThemes as theme}
							<option value={theme.name}>{theme.name}</option>
						{/each}
					</optgroup>
					{#if data.userPalettes.length > 0}
						<optgroup label="Your Custom Palettes">
							{#each data.userPalettes as palette}
								<option value={palette.name}>{palette.name}</option>
							{/each}
						</optgroup>
					{/if}
				</select>
				<ChevronDown class="select-icon" />
			</div>
		</div>

		<div>
			<label id="mode-label" class="text-sm font-medium text-muted-foreground mb-1 block">Mode</label>
			<div class="mode-toggle" role="group" aria-labelledby="mode-label">
				<button
					class:active={previewMode === 'light'}
					onclick={() => (previewMode = 'light')}
				>
					<Sun class="w-4 h-4" />
					Light
				</button>
				<button
					class:active={previewMode === 'dark'}
					onclick={() => (previewMode = 'dark')}
				>
					<Moon class="w-4 h-4" />
					Dark
				</button>
			</div>
		</div>
	</div>

	<!-- Vision Type Selector -->
	<div class="mb-8">
		<label for="vision-type" class="text-sm font-medium text-muted-foreground mb-1 block">Vision Type</label>
		<div class="select-wrapper vision-select">
			<select id="vision-type" bind:value={selectedSimulation}>
				{#each simulations as sim}
					<option value={sim.id}>{sim.name} — {sim.description} ({sim.prevalence})</option>
				{/each}
			</select>
			<ChevronDown class="select-icon" />
		</div>
		<p class="text-sm text-muted-foreground mt-2">
			<span class="font-medium text-foreground">{currentSimulation().name}:</span> {currentSimulation().description} — affects ~{currentSimulation().prevalence} of population
		</p>
	</div>

	<!-- Side by Side Comparison -->
	<div class="grid md:grid-cols-2 gap-6 mb-8">
		<!-- Original -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">Original</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="color-grid">
					{#each paletteColors() as item}
						<div class="color-item">
							<div class="color-swatch" style="background: {item.color};"></div>
							<div class="color-info">
								<span class="color-label">{item.label}</span>
								<span class="color-hex">{item.color}</span>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Simulated -->
		<Card.Root>
			<Card.Header class="pb-3">
				<Card.Title class="text-base">{currentSimulation().name}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="color-grid">
					{#each simulatedColors() as item}
						<div class="color-item">
							<div class="color-swatch" style="background: {item.simulated};"></div>
							<div class="color-info">
								<span class="color-label">{item.label}</span>
								<span class="color-hex">{item.simulated}</span>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Preview Cards -->
	<h2 class="text-xl font-semibold mb-4">Preview Comparison</h2>
	<div class="grid md:grid-cols-2 gap-6">
		<!-- Original Preview -->
		<div class="preview-card" style="--bg: {colors()?.background}; --card: {colors()?.cardBackground}; --text: {colors()?.text}; --primary: {colors()?.primary}; --accent: {colors()?.accent};">
			<div class="preview-header">Original</div>
			<div class="preview-content">
				<h3 class="preview-title">Sample Heading</h3>
				<p class="preview-text">This is how your color palette looks with normal vision. Notice the distinction between primary and accent colors.</p>
				<div class="preview-buttons">
					<button class="btn-primary">Primary</button>
					<button class="btn-accent">Accent</button>
				</div>
			</div>
		</div>

		<!-- Simulated Preview -->
		<div class="preview-card" style="--bg: {simulatedColors().find(c => c.key === 'background')?.simulated}; --card: {simulatedColors().find(c => c.key === 'cardBackground')?.simulated}; --text: {simulatedColors().find(c => c.key === 'text')?.simulated}; --primary: {simulatedColors().find(c => c.key === 'primary')?.simulated}; --accent: {simulatedColors().find(c => c.key === 'accent')?.simulated};">
			<div class="preview-header">{currentSimulation().name}</div>
			<div class="preview-content">
				<h3 class="preview-title">Sample Heading</h3>
				<p class="preview-text">This is how your color palette looks with {currentSimulation().name.toLowerCase()}. Check if important elements are still distinguishable.</p>
				<div class="preview-buttons">
					<button class="btn-primary">Primary</button>
					<button class="btn-accent">Accent</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Tips -->
	<Card.Root class="mt-8">
		<Card.Header class="pb-3">
			<Card.Title class="text-base">Design Tips for Color Accessibility</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li>Don't rely on color alone to convey information - use icons, patterns, or labels</li>
				<li>Ensure sufficient contrast between text and backgrounds (see Accessibility Checker)</li>
				<li>Test red-green color combinations carefully - these are most commonly confused</li>
				<li>Use blue as a safe color - it's rarely affected by color blindness</li>
				<li>Consider using color-blind-friendly palettes from the start</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.select-wrapper {
		position: relative;
	}

	.select-wrapper select {
		appearance: none;
		width: 100%;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	:global(.select-icon) {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		pointer-events: none;
		color: hsl(var(--muted-foreground));
	}

	.mode-toggle {
		display: flex;
		background: hsl(var(--muted));
		border-radius: 6px;
		overflow: hidden;
	}

	.mode-toggle button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.mode-toggle button.active {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.vision-select select {
		min-width: 100%;
		max-width: 100%;
	}

	.color-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.color-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.color-swatch {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.color-info {
		display: flex;
		flex-direction: column;
	}

	.color-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.color-hex {
		font-size: 0.75rem;
		font-family: monospace;
		color: hsl(var(--muted-foreground));
	}

	.preview-card {
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid hsl(var(--border));
	}

	.preview-header {
		padding: 0.5rem 1rem;
		background: hsl(var(--muted));
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
	}

	.preview-content {
		padding: 1.5rem;
		background: var(--bg);
		color: var(--text);
	}

	.preview-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--primary);
		margin-bottom: 0.75rem;
	}

	.preview-text {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text);
		margin-bottom: 1rem;
	}

	.preview-buttons {
		display: flex;
		gap: 0.75rem;
	}

	.btn-primary {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		background: var(--primary);
		color: var(--bg);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-accent {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		background: var(--accent);
		color: var(--bg);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
	}
</style>
