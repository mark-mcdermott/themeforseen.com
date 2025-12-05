<script lang="ts">
	import { Card, Button, Input, Label } from '$lib/components/ui';
	import { Upload, Wand2, Save, RefreshCw, ImageIcon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	// State
	let imageFile = $state<File | null>(null);
	let imageUrl = $state<string | null>(null);
	let extractedColors = $state<string[]>([]);
	let isExtracting = $state(false);
	let isSaving = $state(false);
	let paletteName = $state('');
	let dragOver = $state(false);

	// Generated palette based on extracted colors
	let generatedPalette = $state<{
		primary: string;
		primaryShadow: string;
		accent: string;
		accentShadow: string;
		background: string;
		cardBackground: string;
		text: string;
		extra: string;
	} | null>(null);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.[0]) {
			loadImage(input.files[0]);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		const file = event.dataTransfer?.files?.[0];
		if (file && file.type.startsWith('image/')) {
			loadImage(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function loadImage(file: File) {
		imageFile = file;
		if (imageUrl) {
			URL.revokeObjectURL(imageUrl);
		}
		imageUrl = URL.createObjectURL(file);
		extractedColors = [];
		generatedPalette = null;
	}

	async function extractColors() {
		if (!imageUrl) return;

		isExtracting = true;

		try {
			const img = new Image();
			img.crossOrigin = 'anonymous';

			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error('Failed to load image'));
				img.src = imageUrl!;
			});

			// Create canvas and draw image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;

			// Scale down for performance
			const maxSize = 100;
			const scale = Math.min(maxSize / img.width, maxSize / img.height);
			canvas.width = img.width * scale;
			canvas.height = img.height * scale;

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			// Get pixel data
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;

			// Extract colors using simple quantization
			const colorCounts = new Map<string, number>();

			for (let i = 0; i < pixels.length; i += 4) {
				const r = Math.round(pixels[i] / 32) * 32;
				const g = Math.round(pixels[i + 1] / 32) * 32;
				const b = Math.round(pixels[i + 2] / 32) * 32;
				const a = pixels[i + 3];

				// Skip transparent pixels
				if (a < 128) continue;

				const hex = rgbToHex(r, g, b);
				colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
			}

			// Sort by frequency and get top colors
			const sortedColors = [...colorCounts.entries()]
				.sort((a, b) => b[1] - a[1])
				.map(([color]) => color);

			// Filter out very similar colors and get 6-8 distinct colors
			const distinctColors: string[] = [];
			for (const color of sortedColors) {
				if (distinctColors.length >= 8) break;

				const isDifferent = distinctColors.every((existing) => {
					return colorDistance(hexToRgb(color), hexToRgb(existing)) > 50;
				});

				if (isDifferent) {
					distinctColors.push(color);
				}
			}

			extractedColors = distinctColors;

			// Generate a palette from extracted colors
			if (distinctColors.length >= 2) {
				generatePalette(distinctColors);
			}

			toast.success(`Extracted ${distinctColors.length} colors!`);
		} catch (err) {
			toast.error('Failed to extract colors');
			console.error(err);
		} finally {
			isExtracting = false;
		}
	}

	function generatePalette(colors: string[]) {
		// Sort colors by brightness
		const sortedByBrightness = [...colors].sort((a, b) => {
			return getBrightness(hexToRgb(a)) - getBrightness(hexToRgb(b));
		});

		// Find the most vibrant colors for primary/accent
		const sortedByVibrance = [...colors].sort((a, b) => {
			return getVibrance(hexToRgb(b)) - getVibrance(hexToRgb(a));
		});

		const darkest = sortedByBrightness[0];
		const lightest = sortedByBrightness[sortedByBrightness.length - 1];
		const primary = sortedByVibrance[0];
		const accent = sortedByVibrance.length > 1 ? sortedByVibrance[1] : adjustHue(primary, 30);

		// Determine if the palette is light or dark themed
		const avgBrightness = colors.reduce((sum, c) => sum + getBrightness(hexToRgb(c)), 0) / colors.length;
		const isLightTheme = avgBrightness > 128;

		generatedPalette = {
			primary: primary,
			primaryShadow: darkenColor(primary, 20),
			accent: accent,
			accentShadow: darkenColor(accent, 20),
			background: isLightTheme ? lightest : darkest,
			cardBackground: isLightTheme ? darkenColor(lightest, 5) : lightenColor(darkest, 10),
			text: isLightTheme ? darkest : lightest,
			extra: colors.length > 2 ? sortedByVibrance[2] || primary : primary
		};
	}

	// Color utilities
	function rgbToHex(r: number, g: number, b: number): string {
		return '#' + [r, g, b].map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0')).join('');
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

	function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
		return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
	}

	function getBrightness(c: { r: number; g: number; b: number }): number {
		return (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
	}

	function getVibrance(c: { r: number; g: number; b: number }): number {
		const max = Math.max(c.r, c.g, c.b);
		const min = Math.min(c.r, c.g, c.b);
		const lightness = (max + min) / 2;
		if (max === min) return 0;
		const saturation = lightness > 127 ? (max - min) / (510 - max - min) : (max - min) / (max + min);
		return saturation * (1 - Math.abs(2 * lightness / 255 - 1));
	}

	function darkenColor(hex: string, percent: number): string {
		const { r, g, b } = hexToRgb(hex);
		const factor = 1 - percent / 100;
		return rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor));
	}

	function lightenColor(hex: string, percent: number): string {
		const { r, g, b } = hexToRgb(hex);
		const factor = percent / 100;
		return rgbToHex(
			Math.round(r + (255 - r) * factor),
			Math.round(g + (255 - g) * factor),
			Math.round(b + (255 - b) * factor)
		);
	}

	function adjustHue(hex: string, degrees: number): string {
		const { r, g, b } = hexToRgb(hex);
		// Simple hue rotation - not perfect but works for our needs
		const matrix = [
			[0.213 + 0.787 * Math.cos((degrees * Math.PI) / 180), 0.715 - 0.715 * Math.cos((degrees * Math.PI) / 180), 0.072 - 0.072 * Math.cos((degrees * Math.PI) / 180)],
			[0.213 - 0.213 * Math.cos((degrees * Math.PI) / 180), 0.715 + 0.285 * Math.cos((degrees * Math.PI) / 180), 0.072 - 0.072 * Math.cos((degrees * Math.PI) / 180)],
			[0.213 - 0.213 * Math.cos((degrees * Math.PI) / 180), 0.715 - 0.715 * Math.cos((degrees * Math.PI) / 180), 0.072 + 0.928 * Math.cos((degrees * Math.PI) / 180)]
		];
		const newR = Math.min(255, Math.max(0, Math.round(r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2])));
		const newG = Math.min(255, Math.max(0, Math.round(r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2])));
		const newB = Math.min(255, Math.max(0, Math.round(r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2])));
		return rgbToHex(newR, newG, newB);
	}

	async function savePalette() {
		if (!generatedPalette || !paletteName.trim()) {
			toast.error('Please enter a palette name');
			return;
		}

		isSaving = true;

		try {
			// Create both light and dark variants
			const lightPalette = { ...generatedPalette, h1Color: 'primary' as const, h2Color: 'primary' as const, h3Color: 'accent' as const };

			// Generate dark mode by inverting brightness
			const darkPalette = {
				primary: lightenColor(generatedPalette.primary, 15),
				primaryShadow: generatedPalette.primary,
				accent: lightenColor(generatedPalette.accent, 10),
				accentShadow: generatedPalette.accent,
				background: darkenColor(generatedPalette.text, 10),
				cardBackground: darkenColor(generatedPalette.text, 5),
				text: lightenColor(generatedPalette.background, 10),
				extra: lightenColor(generatedPalette.extra, 10),
				h1Color: 'primary' as const,
				h2Color: 'primary' as const,
				h3Color: 'accent' as const
			};

			const res = await fetch('/api/palettes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: paletteName.trim(),
					light: lightPalette,
					dark: darkPalette,
					tags: ['extracted', 'brand']
				})
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to save');
			}

			toast.success('Palette saved!');
			goto('/palettes');
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			isSaving = false;
		}
	}

	function updatePaletteColor(key: keyof typeof generatedPalette, value: string) {
		if (generatedPalette) {
			generatedPalette = { ...generatedPalette, [key]: value };
		}
	}
</script>

<svelte:head>
	<title>Extract Brand Colors - ThemeForseen</title>
	<meta name="description" content="Extract colors from your logo or brand images" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Wand2 class="w-8 h-8" />
			Extract Brand Colors
		</h1>
		<p class="text-muted-foreground mt-2">
			Upload a logo or image to automatically generate a color palette
		</p>
	</div>

	<div class="grid lg:grid-cols-2 gap-8">
		<!-- Upload Section -->
		<div class="space-y-6">
			<!-- Drop Zone -->
			<Card.Root>
				<Card.Content class="pt-6">
					<div
						class="drop-zone"
						class:drag-over={dragOver}
						class:has-image={!!imageUrl}
						ondrop={handleDrop}
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						role="button"
						tabindex="0"
					>
						{#if imageUrl}
							<img src={imageUrl} alt="Uploaded" class="preview-image" />
						{:else}
							<div class="drop-placeholder">
								<ImageIcon class="w-12 h-12 opacity-40" />
								<p class="mt-3 font-medium">Drop an image here</p>
								<p class="text-sm text-muted-foreground mt-1">or click to browse</p>
							</div>
						{/if}
						<input
							type="file"
							accept="image/*"
							onchange={handleFileSelect}
							class="file-input"
						/>
					</div>

					<div class="flex gap-3 mt-4">
						<Button.Root
							onclick={extractColors}
							disabled={!imageUrl || isExtracting}
							class="flex-1 gap-2"
						>
							{#if isExtracting}
								<RefreshCw class="w-4 h-4 animate-spin" />
								Extracting...
							{:else}
								<Wand2 class="w-4 h-4" />
								Extract Colors
							{/if}
						</Button.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Extracted Colors -->
			{#if extractedColors.length > 0}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Extracted Colors</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="color-swatches">
							{#each extractedColors as color}
								<div class="swatch-item">
									<div class="swatch" style="background: {color}"></div>
									<span class="swatch-label">{color}</span>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Generated Palette -->
		<div class="space-y-6">
			{#if generatedPalette}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Generated Palette</Card.Title>
						<p class="text-sm text-muted-foreground">Click colors to adjust</p>
					</Card.Header>
					<Card.Content>
						<div class="palette-grid">
							{#each Object.entries(generatedPalette) as [key, value]}
								<div class="palette-item">
									<label class="palette-label">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
									<div class="palette-color-row">
										<input
											type="color"
											{value}
											onchange={(e) => updatePaletteColor(key as keyof typeof generatedPalette, e.currentTarget.value)}
											class="color-input"
										/>
										<span class="color-value">{value}</span>
									</div>
								</div>
							{/each}
						</div>

						<!-- Preview -->
						<div class="preview-box mt-6" style="
							background: {generatedPalette.background};
							color: {generatedPalette.text};
						">
							<h3 style="color: {generatedPalette.primary}; margin-bottom: 0.5rem;">Preview Heading</h3>
							<p style="margin-bottom: 1rem;">This is how your palette looks.</p>
							<div style="display: flex; gap: 0.5rem;">
								<button style="background: {generatedPalette.primary}; color: {generatedPalette.background}; padding: 0.5rem 1rem; border: none; border-radius: 6px;">Primary</button>
								<button style="background: {generatedPalette.accent}; color: {generatedPalette.background}; padding: 0.5rem 1rem; border: none; border-radius: 6px;">Accent</button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Save Section -->
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Save as Custom Palette</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="space-y-4">
							<div>
								<Label for="palette-name">Palette Name</Label>
								<Input
									id="palette-name"
									bind:value={paletteName}
									placeholder="My Brand Colors"
									class="mt-1"
								/>
							</div>
							<Button.Root
								onclick={savePalette}
								disabled={isSaving || !paletteName.trim()}
								class="w-full gap-2"
							>
								{#if isSaving}
									<RefreshCw class="w-4 h-4 animate-spin" />
									Saving...
								{:else}
									<Save class="w-4 h-4" />
									Save Palette
								{/if}
							</Button.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root>
					<Card.Content class="py-12 text-center text-muted-foreground">
						<Wand2 class="w-12 h-12 mx-auto mb-3 opacity-40" />
						<p>Upload an image and click "Extract Colors"</p>
						<p class="text-sm mt-1">to generate a palette</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>

<style>
	.drop-zone {
		position: relative;
		border: 2px dashed hsl(var(--border));
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		transition: all 0.2s;
		cursor: pointer;
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.drop-zone:hover,
	.drop-zone.drag-over {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.05);
	}

	.drop-zone.has-image {
		padding: 1rem;
	}

	.drop-placeholder {
		color: hsl(var(--muted-foreground));
	}

	.preview-image {
		max-width: 100%;
		max-height: 250px;
		object-fit: contain;
		border-radius: 8px;
	}

	.file-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.color-swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		gap: 0.75rem;
	}

	.swatch-item {
		text-align: center;
	}

	.swatch {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
	}

	.swatch-label {
		font-size: 0.7rem;
		font-family: monospace;
		color: hsl(var(--muted-foreground));
		margin-top: 0.25rem;
		display: block;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.palette-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.palette-label {
		font-size: 0.75rem;
		text-transform: capitalize;
		color: hsl(var(--muted-foreground));
	}

	.palette-color-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.color-input {
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		padding: 0;
	}

	.color-value {
		font-family: monospace;
		font-size: 0.8rem;
		color: hsl(var(--foreground));
	}

	.preview-box {
		padding: 1.5rem;
		border-radius: 8px;
	}

	.preview-box h3 {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.preview-box p {
		font-size: 0.9rem;
	}
</style>
