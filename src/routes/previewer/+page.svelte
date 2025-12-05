<script lang="ts">
	import { Sun, Moon, Monitor, ChevronDown } from 'lucide-svelte';
	import { colorThemes, fontPairings } from 'theme-forseen';
	import {
		LandingTemplate,
		BlogTemplate,
		DashboardTemplate,
		EcommerceTemplate,
		templates
	} from '$lib/components/preview-templates';

	let { data } = $props();

	// State
	let selectedTemplate = $state<string>('landing');
	let selectedPalette = $state<string>(colorThemes[0]?.name || '');
	let selectedFont = $state<string>(fontPairings[0]?.name || '');
	let previewMode = $state<'light' | 'dark' | 'system'>('light');
	let isFullscreen = $state(false);

	// Find selected theme and font
	const currentTheme = $derived(colorThemes.find((t) => t.name === selectedPalette) || colorThemes[0]);
	const currentFont = $derived(fontPairings.find((f) => f.name === selectedFont) || fontPairings[0]);

	// Determine actual mode based on selection
	const actualMode = $derived(() => {
		if (previewMode === 'system') {
			return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		}
		return previewMode;
	});

	// Get colors for current mode
	const colors = $derived(actualMode() === 'dark' ? currentTheme?.dark : currentTheme?.light);

	// Build CSS variables
	const cssVariables = $derived(() => {
		if (!colors || !currentFont) return '';
		const mode = colors;
		return `
			--primary: ${mode.primary};
			--primary-shadow: ${mode.primaryShadow};
			--accent: ${mode.accent};
			--accent-shadow: ${mode.accentShadow};
			--background: ${mode.background};
			--card-background: ${mode.cardBackground};
			--text: ${mode.text};
			--extra: ${mode.extra};
			--h1-color: ${mode[`${mode.h1Color}` as keyof typeof mode] || mode.primary};
			--h2-color: ${mode[`${mode.h2Color}` as keyof typeof mode] || mode.primary};
			--h3-color: ${mode[`${mode.h3Color}` as keyof typeof mode] || mode.accent};
			--font-heading: '${currentFont.heading}', system-ui, sans-serif;
			--font-body: '${currentFont.body}', system-ui, sans-serif;
		`;
	});

	// Load Google Fonts
	$effect(() => {
		if (currentFont && typeof document !== 'undefined') {
			const fonts = [currentFont.heading, currentFont.body].filter((f, i, a) => a.indexOf(f) === i);
			fonts.forEach((font) => {
				const linkId = `font-${font.replace(/\s/g, '-')}`;
				if (!document.getElementById(linkId)) {
					const link = document.createElement('link');
					link.id = linkId;
					link.rel = 'stylesheet';
					link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, '+')}:wght@400;500;600;700&display=swap`;
					document.head.appendChild(link);
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Site Previewer - ThemeForseen</title>
	<meta name="description" content="Preview your color themes on real website templates" />
</svelte:head>

<div class="previewer-page" class:fullscreen={isFullscreen}>
	<!-- Controls Bar -->
	<div class="controls-bar">
		<div class="controls-inner">
			<!-- Template Selector -->
			<div class="control-group">
				<label for="template">Template</label>
				<div class="select-wrapper">
					<select id="template" bind:value={selectedTemplate}>
						{#each templates as template}
							<option value={template.id}>{template.name}</option>
						{/each}
					</select>
					<ChevronDown class="select-icon" />
				</div>
			</div>

			<!-- Palette Selector -->
			<div class="control-group">
				<label for="palette">Color Palette</label>
				<div class="select-wrapper">
					<select id="palette" bind:value={selectedPalette}>
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

			<!-- Font Selector -->
			<div class="control-group">
				<label for="font">Font Pairing</label>
				<div class="select-wrapper">
					<select id="font" bind:value={selectedFont}>
						{#each fontPairings as font}
							<option value={font.name}>{font.name}</option>
						{/each}
					</select>
					<ChevronDown class="select-icon" />
				</div>
			</div>

			<!-- Mode Toggle -->
			<div class="control-group">
				<label>Mode</label>
				<div class="mode-toggle">
					<button
						class:active={previewMode === 'light'}
						onclick={() => (previewMode = 'light')}
						title="Light mode"
					>
						<Sun class="w-4 h-4" />
					</button>
					<button
						class:active={previewMode === 'dark'}
						onclick={() => (previewMode = 'dark')}
						title="Dark mode"
					>
						<Moon class="w-4 h-4" />
					</button>
					<button
						class:active={previewMode === 'system'}
						onclick={() => (previewMode = 'system')}
						title="System preference"
					>
						<Monitor class="w-4 h-4" />
					</button>
				</div>
			</div>

			<!-- Fullscreen Toggle -->
			<button
				class="fullscreen-btn"
				onclick={() => (isFullscreen = !isFullscreen)}
			>
				{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
			</button>
		</div>
	</div>

	<!-- Preview Area -->
	<div class="preview-container">
		<div class="preview-frame" style={cssVariables()}>
			{#if selectedTemplate === 'landing'}
				<LandingTemplate />
			{:else if selectedTemplate === 'blog'}
				<BlogTemplate />
			{:else if selectedTemplate === 'dashboard'}
				<DashboardTemplate />
			{:else if selectedTemplate === 'ecommerce'}
				<EcommerceTemplate />
			{/if}
		</div>
	</div>
</div>

<style>
	.previewer-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 80px);
		background: var(--background);
	}

	.previewer-page.fullscreen {
		position: fixed;
		inset: 0;
		height: 100vh;
		z-index: 50;
	}

	/* Controls Bar */
	.controls-bar {
		background: hsl(var(--card));
		border-bottom: 1px solid hsl(var(--border));
		padding: 0.75rem 0;
		flex-shrink: 0;
	}

	.controls-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: flex-end;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.control-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: hsl(var(--muted-foreground));
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.select-wrapper {
		position: relative;
	}

	.select-wrapper select {
		appearance: none;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		min-width: 180px;
		cursor: pointer;
	}

	.select-wrapper select:focus {
		outline: none;
		border-color: hsl(var(--primary));
	}

	.select-icon {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		pointer-events: none;
		color: hsl(var(--muted-foreground));
	}

	/* Mode Toggle */
	.mode-toggle {
		display: flex;
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 6px;
		overflow: hidden;
	}

	.mode-toggle button {
		background: transparent;
		border: none;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		color: hsl(var(--muted-foreground));
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.mode-toggle button:not(:last-child) {
		border-right: 1px solid hsl(var(--border));
	}

	.mode-toggle button:hover {
		background: hsl(var(--muted));
	}

	.mode-toggle button.active {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	/* Fullscreen Button */
	.fullscreen-btn {
		margin-left: auto;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.fullscreen-btn:hover {
		opacity: 0.9;
	}

	/* Preview Container */
	.preview-container {
		flex: 1;
		overflow: hidden;
		background: #f0f0f0;
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	.previewer-page.fullscreen .preview-container {
		padding: 0;
	}

	.preview-frame {
		width: 100%;
		max-width: 1400px;
		height: 100%;
		overflow-y: auto;
		background: var(--background, #fff);
		border-radius: 8px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
	}

	.previewer-page.fullscreen .preview-frame {
		max-width: none;
		border-radius: 0;
		box-shadow: none;
	}

	@media (max-width: 900px) {
		.controls-inner {
			gap: 1rem;
		}
		.select-wrapper select {
			min-width: 140px;
		}
	}

	@media (max-width: 600px) {
		.control-group {
			flex: 1 1 calc(50% - 0.5rem);
		}
		.fullscreen-btn {
			flex: 1 1 100%;
		}
	}
</style>
