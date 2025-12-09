<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { Search, ExternalLink, Check, Filter } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import {
		fontsourceFonts,
		fontshareFonts,
		fontSquirrelFonts,
		extendedFontPairings,
		getFontCSSLink,
		fontSourceInfo,
		type Font,
		type FontSource
	} from '$lib/font-sources';
	import { fontPairings } from 'theme-forseen';

	// Preload first batch of fonts on mount
	onMount(() => {
		// Load first 10 fonts immediately for better UX
		const fontsToPreload = [...fontsourceFonts, ...fontshareFonts, ...fontSquirrelFonts].slice(0, 10);
		fontsToPreload.forEach(font => loadFont(font));
	});

	// State
	let searchQuery = $state('');
	let selectedSource = $state<FontSource | 'all'>('all');
	let selectedCategory = $state<string>('all');
	let previewText = $state('The quick brown fox jumps over the lazy dog');
	let previewSize = $state(32);
	let loadedFonts = $state<Set<string>>(new Set());
	let selectedWeights = $state<Record<string, number>>({}); // Track selected weight per font

	// Get or set default weight for a font
	function getSelectedWeight(fontName: string, availableWeights: number[]): number {
		if (selectedWeights[fontName] !== undefined) {
			return selectedWeights[fontName];
		}
		// Default to 400 if available, otherwise first weight
		return availableWeights.includes(400) ? 400 : availableWeights[0];
	}

	function setSelectedWeight(fontName: string, weight: number) {
		selectedWeights = { ...selectedWeights, [fontName]: weight };
	}

	// Categories
	const categories = ['all', 'sans-serif', 'serif', 'display', 'monospace', 'handwriting'];

	// Filter fonts
	const filteredFonts = $derived(() => {
		let fonts: Font[] = [];

		if (selectedSource === 'all' || selectedSource === 'fontsource') {
			fonts = [...fonts, ...fontsourceFonts];
		}
		if (selectedSource === 'all' || selectedSource === 'fontshare') {
			fonts = [...fonts, ...fontshareFonts];
		}
		if (selectedSource === 'all' || selectedSource === 'fontsquirrel') {
			fonts = [...fonts, ...fontSquirrelFonts];
		}

		if (selectedCategory !== 'all') {
			fonts = fonts.filter((f) => f.category === selectedCategory);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			fonts = fonts.filter((f) => f.name.toLowerCase().includes(query));
		}

		return fonts;
	});

	// Google fonts from existing pairings
	const googleFonts = $derived(() => {
		const fonts = new Set<string>();
		fontPairings.forEach((p) => {
			fonts.add(p.heading);
			fonts.add(p.body);
		});
		return Array.from(fonts).sort();
	});

	// Load a font
	async function loadFont(font: Font) {
		if (loadedFonts.has(font.name)) return;

		// Mark as loading to prevent duplicate requests
		loadedFonts = new Set([...loadedFonts, font.name]);

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = getFontCSSLink(font);
		document.head.appendChild(link);

		// Wait for the font to actually load
		try {
			await document.fonts.load(`400 16px "${font.family}"`);
		} catch {
			// Font load failed, but link is still there for retry
		}
	}

	// Source badge color
	function getSourceColor(source: FontSource): string {
		switch (source) {
			case 'fontsource':
				return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
			case 'fontshare':
				return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
			case 'fontsquirrel':
				return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
			default:
				return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
		}
	}

	// Stats
	const stats = $derived(() => ({
		fontsource: fontsourceFonts.length,
		fontshare: fontshareFonts.length,
		fontsquirrel: fontSquirrelFonts.length,
		google: googleFonts().length,
		total: fontsourceFonts.length + fontshareFonts.length + fontSquirrelFonts.length + googleFonts().length
	}));
</script>

<svelte:head>
	<title>Font Explorer - ThemeForseen</title>
	<meta name="description" content="Explore fonts from Fontsource, Fontshare, and Font Squirrel" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Font Explorer</h1>
		<p class="text-muted-foreground mt-2">
			Browse {stats().total}+ fonts from multiple sources - all free for commercial use
		</p>
	</div>

	<!-- Source Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
		<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => (selectedSource = 'fontsource')}>
			<Card.Content class="py-4 text-center">
				<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats().fontsource}</div>
				<div class="text-sm text-muted-foreground">Fontsource</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => (selectedSource = 'fontshare')}>
			<Card.Content class="py-4 text-center">
				<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats().fontshare}</div>
				<div class="text-sm text-muted-foreground">Fontshare</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => (selectedSource = 'fontsquirrel')}>
			<Card.Content class="py-4 text-center">
				<div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats().fontsquirrel}</div>
				<div class="text-sm text-muted-foreground">Font Squirrel</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="cursor-pointer hover:border-primary transition-colors" onclick={() => (selectedSource = 'all')}>
			<Card.Content class="py-4 text-center">
				<div class="text-2xl font-bold">{stats().google}</div>
				<div class="text-sm text-muted-foreground">Google Fonts</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Filters -->
	<Card.Root class="mb-8">
		<Card.Content class="py-4">
			<div class="flex flex-wrap gap-4 items-center">
				<!-- Search -->
				<div class="relative flex-1 min-w-[200px]">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search fonts..."
						bind:value={searchQuery}
						class="input !pl-10"
					/>
				</div>

				<!-- Source Filter -->
				<div class="flex gap-2">
					<button
						class="filter-btn"
						class:active={selectedSource === 'all'}
						onclick={() => (selectedSource = 'all')}
					>
						All
					</button>
					<button
						class="filter-btn"
						class:active={selectedSource === 'fontsource'}
						onclick={() => (selectedSource = 'fontsource')}
					>
						Fontsource
					</button>
					<button
						class="filter-btn"
						class:active={selectedSource === 'fontshare'}
						onclick={() => (selectedSource = 'fontshare')}
					>
						Fontshare
					</button>
					<button
						class="filter-btn"
						class:active={selectedSource === 'fontsquirrel'}
						onclick={() => (selectedSource = 'fontsquirrel')}
					>
						Font Squirrel
					</button>
				</div>

				<!-- Category Filter -->
				<select bind:value={selectedCategory} class="input w-auto">
					{#each categories as cat}
						<option value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
					{/each}
				</select>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Preview Settings -->
	<Card.Root class="mb-8">
		<Card.Content class="py-4">
			<div class="flex flex-wrap gap-4 items-center">
				<div class="flex-1 min-w-[200px]">
					<label for="preview-text" class="text-sm text-muted-foreground block mb-1">Preview Text</label>
					<input
						id="preview-text"
						type="text"
						bind:value={previewText}
						class="input"
					/>
				</div>
				<div class="w-32">
					<label for="preview-size" class="text-sm text-muted-foreground block mb-1">Size: {previewSize}px</label>
					<input
						id="preview-size"
						type="range"
						min="16"
						max="72"
						bind:value={previewSize}
						class="w-full"
					/>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Fonts Grid -->
	<div class="space-y-4">
		{#each filteredFonts() as font}
			<Card.Root class="font-card" onmouseenter={() => loadFont(font)}>
				<Card.Content class="py-4">
					<div class="flex items-start justify-between mb-3">
						<div>
							<h3 class="font-semibold">{font.name}</h3>
							<div class="flex items-center gap-2 mt-1">
								<span class="badge {getSourceColor(font.source)}">
									{fontSourceInfo[font.source].name}
								</span>
								<span class="text-xs text-muted-foreground">{font.category}</span>
								{#if font.variable}
									<span class="text-xs text-green-600 dark:text-green-400">Variable</span>
								{/if}
							</div>
						</div>
						<a
							href={fontSourceInfo[font.source].url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-muted-foreground hover:text-foreground"
						>
							<ExternalLink class="w-4 h-4" />
						</a>
					</div>

					<div
						class="font-preview"
						style="font-family: '{font.family}', sans-serif; font-size: {previewSize}px; font-weight: {getSelectedWeight(font.name, font.weights)};"
					>
						{#if loadedFonts.has(font.name)}
							{previewText}
						{:else}
							<span class="text-muted-foreground italic text-base">Hover to load font...</span>
						{/if}
					</div>

					<div class="mt-3 flex items-center gap-1 flex-wrap">
						<span class="text-xs text-muted-foreground mr-1">Weight:</span>
						{#each font.weights as weight}
							<button
								class="weight-btn {getSelectedWeight(font.name, font.weights) === weight ? 'active' : ''}"
								onclick={() => setSelectedWeight(font.name, weight)}
							>
								{weight}
							</button>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	{#if filteredFonts().length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<p class="text-muted-foreground">No fonts found matching your criteria</p>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Font Pairings Section -->
	<div class="mt-12">
		<h2 class="text-2xl font-bold mb-4">Curated Font Pairings</h2>
		<p class="text-muted-foreground mb-6">
			Pre-selected heading + body font combinations from alternative sources
		</p>

		<div class="grid md:grid-cols-2 gap-4">
			{#each extendedFontPairings.slice(0, 12) as pairing}
				<Card.Root
					class="pairing-card"
					onmouseenter={() => {
						loadFont(pairing.heading);
						loadFont(pairing.body);
					}}
				>
					<Card.Content class="py-4">
						<div class="flex justify-between items-start mb-3">
							<h3 class="font-medium">{pairing.name}</h3>
							<div class="flex gap-1">
								{#if pairing.tags}
									{#each pairing.tags.slice(0, 2) as tag}
										<span class="text-xs px-2 py-0.5 bg-muted rounded">{tag}</span>
									{/each}
								{/if}
							</div>
						</div>

						<div class="space-y-2">
							<div>
								<span class="text-xs text-muted-foreground">Heading:</span>
								<div
									class="text-xl font-semibold"
									style="font-family: '{pairing.heading.family}', sans-serif;"
								>
									{#if loadedFonts.has(pairing.heading.name)}
										{pairing.heading.name}
									{:else}
										<span class="text-muted-foreground italic text-base">Loading...</span>
									{/if}
								</div>
							</div>
							<div>
								<span class="text-xs text-muted-foreground">Body:</span>
								<div style="font-family: '{pairing.body.family}', sans-serif;">
									{#if loadedFonts.has(pairing.body.name)}
										The quick brown fox jumps over the lazy dog
									{:else}
										<span class="text-muted-foreground italic text-sm">Loading...</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="flex gap-2 mt-3">
							<span class="badge {getSourceColor(pairing.heading.source)}">{pairing.heading.source}</span>
							{#if pairing.heading.source !== pairing.body.source}
								<span class="badge {getSourceColor(pairing.body.source)}">{pairing.body.source}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>

	<!-- Info Cards -->
	<div class="grid md:grid-cols-3 gap-4 mt-12">
		{#each Object.entries(fontSourceInfo).filter(([key]) => key !== 'google') as [key, info]}
			<Card.Root>
				<Card.Content class="py-4">
					<h3 class="font-semibold mb-2">{info.name}</h3>
					<p class="text-sm text-muted-foreground mb-3">{info.description}</p>
					<a
						href={info.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-primary hover:underline inline-flex items-center gap-1"
					>
						Visit site <ExternalLink class="w-3 h-3" />
					</a>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<style>
	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.filter-btn {
		padding: 0.4rem 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		background: transparent;
		color: hsl(var(--muted-foreground));
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.filter-btn:hover {
		background: hsl(var(--muted));
	}

	.filter-btn.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-color: hsl(var(--primary));
	}

	.badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.font-preview {
		min-height: 2.5rem;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.font-card {
		transition: border-color 0.15s;
	}

	.font-card:hover {
		border-color: hsl(var(--primary));
	}

	.pairing-card {
		transition: border-color 0.15s;
	}

	.pairing-card:hover {
		border-color: hsl(var(--primary));
	}

	.weight-btn {
		padding: 0.2rem 0.5rem;
		border: 1px solid hsl(var(--border));
		border-radius: 4px;
		background: transparent;
		color: hsl(var(--muted-foreground));
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.15s;
		font-variant-numeric: tabular-nums;
	}

	.weight-btn:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.weight-btn.active {
		background: hsl(var(--foreground));
		color: hsl(var(--background));
		border-color: hsl(var(--foreground));
	}
</style>
