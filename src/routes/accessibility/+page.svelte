<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Eye, Check, X, AlertTriangle, ChevronDown, Sun, Moon } from 'lucide-svelte';
	import { colorThemes } from '$lib/themes';

	let { data } = $props();

	// State
	let selectedPalette = $state<string>(colorThemes[0]?.name || '');
	let previewMode = $state<'light' | 'dark'>('light');

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

	// WCAG contrast calculation
	function getLuminance(hex: string): number {
		const rgb = hexToRgb(hex);
		const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	function getContrastRatio(color1: string, color2: string): number {
		const l1 = getLuminance(color1);
		const l2 = getLuminance(color2);
		const lighter = Math.max(l1, l2);
		const darker = Math.min(l1, l2);
		return (lighter + 0.05) / (darker + 0.05);
	}

	function hexToRgb(hex: string): { r: number; g: number; b: number } {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: { r: 0, g: 0, b: 0 };
	}

	function getWcagLevel(ratio: number, isLargeText: boolean): { level: 'AAA' | 'AA' | 'Fail'; pass: boolean } {
		if (isLargeText) {
			if (ratio >= 4.5) return { level: 'AAA', pass: true };
			if (ratio >= 3) return { level: 'AA', pass: true };
		} else {
			if (ratio >= 7) return { level: 'AAA', pass: true };
			if (ratio >= 4.5) return { level: 'AA', pass: true };
		}
		return { level: 'Fail', pass: false };
	}

	// Color combinations to check
	const colorCombinations = $derived(() => {
		const c = colors();
		if (!c) return [];

		return [
			{ name: 'Text on Background', fg: c.text, bg: c.background, type: 'body' },
			{ name: 'Text on Card', fg: c.text, bg: c.cardBackground, type: 'body' },
			{ name: 'Primary on Background', fg: c.primary, bg: c.background, type: 'heading' },
			{ name: 'Primary on Card', fg: c.primary, bg: c.cardBackground, type: 'heading' },
			{ name: 'Accent on Background', fg: c.accent, bg: c.background, type: 'heading' },
			{ name: 'Accent on Card', fg: c.accent, bg: c.cardBackground, type: 'heading' },
			{ name: 'Background on Primary (Button)', fg: c.background, bg: c.primary, type: 'button' },
			{ name: 'Background on Accent (Button)', fg: c.background, bg: c.accent, type: 'button' }
		];
	});

	// Calculate all results
	const contrastResults = $derived(() => {
		return colorCombinations().map((combo) => {
			const ratio = getContrastRatio(combo.fg, combo.bg);
			const isLargeText = combo.type === 'heading' || combo.type === 'button';
			const wcag = getWcagLevel(ratio, isLargeText);
			return {
				...combo,
				ratio: ratio.toFixed(2),
				wcag
			};
		});
	});

	// Summary stats
	const summary = $derived(() => {
		const results = contrastResults();
		const passing = results.filter((r) => r.wcag.pass).length;
		const failing = results.length - passing;
		const aaaCount = results.filter((r) => r.wcag.level === 'AAA').length;
		return { passing, failing, aaaCount, total: results.length };
	});
</script>

<svelte:head>
	<title>Accessibility Checker - ThemeForseen</title>
	<meta name="description" content="Check WCAG contrast ratios for your color palettes" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Eye class="w-8 h-8" />
			Accessibility Checker
		</h1>
		<p class="text-muted-foreground mt-2">
			Check WCAG 2.1 contrast ratios for your color combinations
		</p>
	</div>

	<!-- Controls -->
	<div class="flex flex-wrap gap-4 mb-8">
		<div class="flex-1 min-w-[200px]">
			<label class="text-sm font-medium text-muted-foreground mb-1 block">Palette</label>
			<div class="select-wrapper">
				<select bind:value={selectedPalette} class="w-full">
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
			<label class="text-sm font-medium text-muted-foreground mb-1 block">Mode</label>
			<div class="mode-toggle">
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

	<!-- Summary -->
	<div class="grid grid-cols-3 gap-4 mb-8">
		<Card.Root class="text-center py-4">
			<div class="text-3xl font-bold text-green-500">{summary().passing}</div>
			<div class="text-sm text-muted-foreground">{summary().passing === 1 ? 'Color' : 'Colors'} Passing</div>
		</Card.Root>
		<Card.Root class="text-center py-4">
			<div class="text-3xl font-bold text-red-500">{summary().failing}</div>
			<div class="text-sm text-muted-foreground">{summary().failing === 1 ? 'Color' : 'Colors'} Failing</div>
		</Card.Root>
		<Card.Root class="text-center py-4">
			<div class="text-3xl font-bold text-blue-500">{summary().aaaCount}</div>
			<div class="text-sm text-muted-foreground">{summary().aaaCount === 1 ? 'Color' : 'Colors'} at AAA</div>
		</Card.Root>
	</div>

	<!-- WCAG Legend -->
	<Card.Root class="mb-8">
		<Card.Content class="py-4">
			<div class="flex flex-wrap gap-6 text-sm">
				<div class="flex items-center gap-2">
					<span class="badge badge-aaa">AAA</span>
					<span class="text-muted-foreground">Ratio ≥ 7:1 (normal) or ≥ 4.5:1 (large)</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="badge badge-aa">AA</span>
					<span class="text-muted-foreground">Ratio ≥ 4.5:1 (normal) or ≥ 3:1 (large)</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="badge badge-fail">Fail</span>
					<span class="text-muted-foreground">Below minimum requirements</span>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Results Grid -->
	<div class="grid md:grid-cols-2 gap-4">
		{#each contrastResults() as result}
			<Card.Root class="overflow-hidden">
				<div class="flex">
					<!-- Preview -->
					<div
						class="w-32 flex items-center justify-center text-xl font-bold shrink-0"
						style="background: {result.bg}; color: {result.fg};"
					>
						Aa
					</div>

					<!-- Details -->
					<div class="flex-1 p-4">
						<div class="flex items-start justify-between mb-2">
							<div>
								<h3 class="font-medium text-sm">{result.name}</h3>
								<p class="text-xs text-muted-foreground mt-0.5">
									{result.type === 'heading' ? 'Large text' : result.type === 'button' ? 'Button text' : 'Normal text'}
								</p>
							</div>
							<span class="badge badge-{result.wcag.level.toLowerCase()}">
								{result.wcag.level}
							</span>
						</div>

						<div class="flex items-center gap-4 text-sm">
							<div class="flex items-center gap-1.5">
								{#if result.wcag.pass}
									<Check class="w-4 h-4 text-green-500" />
								{:else}
									<X class="w-4 h-4 text-red-500" />
								{/if}
								<span class="font-mono">{result.ratio}:1</span>
							</div>

							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<div class="flex items-center gap-1">
									<span class="color-dot" style="background: {result.fg};"></span>
									{result.fg}
								</div>
								<span>/</span>
								<div class="flex items-center gap-1">
									<span class="color-dot" style="background: {result.bg};"></span>
									{result.bg}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card.Root>
		{/each}
	</div>

	<!-- Tips -->
	{#if summary().failing > 0}
		<Card.Root class="mt-8">
			<Card.Header class="pb-3">
				<div class="flex items-center gap-2">
					<AlertTriangle class="w-5 h-5 text-yellow-500" />
					<Card.Title class="text-base">Suggestions</Card.Title>
				</div>
			</Card.Header>
			<Card.Content>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li>• Increase contrast by darkening/lightening colors</li>
					<li>• Consider using a darker text color on light backgrounds</li>
					<li>• Primary/accent colors may need adjustment for text use</li>
					<li>• Use larger text sizes (18px+) for colors with 3:1 to 4.5:1 ratio</li>
					<li>• Test with the color blindness simulator for additional insight</li>
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}
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

	.badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge-aaa {
		background: hsl(142 76% 36% / 0.15);
		color: hsl(142 76% 36%);
	}

	.badge-aa {
		background: hsl(217 91% 60% / 0.15);
		color: hsl(217 91% 60%);
	}

	.badge-fail {
		background: hsl(0 84% 60% / 0.15);
		color: hsl(0 84% 60%);
	}

	.color-dot {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.15);
	}
</style>
