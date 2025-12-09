<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { Download, Copy, Check, FileCode, ChevronDown } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { colorThemes, fontPairings } from 'theme-forseen';

	let { data } = $props();

	type ExportFormat = 'css' | 'sass' | 'tailwind' | 'json';

	// State
	let selectedPalette = $state<string>(colorThemes[0]?.name || '');
	let selectedFont = $state<string>(fontPairings[0]?.name || '');
	let selectedFormat = $state<ExportFormat>('css');
	let includeFont = $state(true);
	let copied = $state(false);

	// Find selected theme and font
	const currentTheme = $derived(() => {
		// Check built-in first
		const builtIn = colorThemes.find((t) => t.name === selectedPalette);
		if (builtIn) return builtIn;

		// Check custom palettes
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

	const currentFont = $derived(fontPairings.find((f) => f.name === selectedFont) || fontPairings[0]);

	// Generate CSS export
	function generateCSS() {
		const theme = currentTheme();
		const font = currentFont;
		if (!theme) return '';

		let css = `/* ThemeForseen Export: ${theme.name} */\n\n`;

		// Light mode
		css += `:root {\n`;
		css += `  /* Light Mode Colors */\n`;
		css += `  --tf-primary: ${theme.light.primary};\n`;
		css += `  --tf-primary-shadow: ${theme.light.primaryShadow};\n`;
		css += `  --tf-accent: ${theme.light.accent};\n`;
		css += `  --tf-accent-shadow: ${theme.light.accentShadow};\n`;
		css += `  --tf-background: ${theme.light.background};\n`;
		css += `  --tf-card-background: ${theme.light.cardBackground};\n`;
		css += `  --tf-text: ${theme.light.text};\n`;
		css += `  --tf-extra: ${theme.light.extra};\n`;
		if (includeFont && font) {
			css += `\n  /* Fonts */\n`;
			css += `  --tf-font-heading: '${font.heading}', system-ui, sans-serif;\n`;
			css += `  --tf-font-body: '${font.body}', system-ui, sans-serif;\n`;
		}
		css += `}\n\n`;

		// Dark mode
		css += `@media (prefers-color-scheme: dark) {\n`;
		css += `  :root {\n`;
		css += `    /* Dark Mode Colors */\n`;
		css += `    --tf-primary: ${theme.dark.primary};\n`;
		css += `    --tf-primary-shadow: ${theme.dark.primaryShadow};\n`;
		css += `    --tf-accent: ${theme.dark.accent};\n`;
		css += `    --tf-accent-shadow: ${theme.dark.accentShadow};\n`;
		css += `    --tf-background: ${theme.dark.background};\n`;
		css += `    --tf-card-background: ${theme.dark.cardBackground};\n`;
		css += `    --tf-text: ${theme.dark.text};\n`;
		css += `    --tf-extra: ${theme.dark.extra};\n`;
		css += `  }\n`;
		css += `}\n`;

		if (includeFont && font) {
			css += `\n/* Google Fonts Import */\n`;
			const fonts = [font.heading, font.body].filter((f, i, a) => a.indexOf(f) === i);
			css += `@import url('https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f.replace(/\s/g, '+')}:wght@400;500;600;700`).join('&')}&display=swap');\n`;
		}

		return css;
	}

	// Generate Sass export
	function generateSass() {
		const theme = currentTheme();
		const font = currentFont;
		if (!theme) return '';

		let sass = `// ThemeForseen Export: ${theme.name}\n\n`;

		sass += `// Light Mode Colors\n`;
		sass += `$tf-primary-light: ${theme.light.primary};\n`;
		sass += `$tf-primary-shadow-light: ${theme.light.primaryShadow};\n`;
		sass += `$tf-accent-light: ${theme.light.accent};\n`;
		sass += `$tf-accent-shadow-light: ${theme.light.accentShadow};\n`;
		sass += `$tf-background-light: ${theme.light.background};\n`;
		sass += `$tf-card-background-light: ${theme.light.cardBackground};\n`;
		sass += `$tf-text-light: ${theme.light.text};\n`;
		sass += `$tf-extra-light: ${theme.light.extra};\n\n`;

		sass += `// Dark Mode Colors\n`;
		sass += `$tf-primary-dark: ${theme.dark.primary};\n`;
		sass += `$tf-primary-shadow-dark: ${theme.dark.primaryShadow};\n`;
		sass += `$tf-accent-dark: ${theme.dark.accent};\n`;
		sass += `$tf-accent-shadow-dark: ${theme.dark.accentShadow};\n`;
		sass += `$tf-background-dark: ${theme.dark.background};\n`;
		sass += `$tf-card-background-dark: ${theme.dark.cardBackground};\n`;
		sass += `$tf-text-dark: ${theme.dark.text};\n`;
		sass += `$tf-extra-dark: ${theme.dark.extra};\n`;

		if (includeFont && font) {
			sass += `\n// Fonts\n`;
			sass += `$tf-font-heading: '${font.heading}', system-ui, sans-serif;\n`;
			sass += `$tf-font-body: '${font.body}', system-ui, sans-serif;\n`;
		}

		sass += `\n// Mixin for applying theme\n`;
		sass += `@mixin tf-light-theme {\n`;
		sass += `  --tf-primary: #{$tf-primary-light};\n`;
		sass += `  --tf-accent: #{$tf-accent-light};\n`;
		sass += `  --tf-background: #{$tf-background-light};\n`;
		sass += `  --tf-text: #{$tf-text-light};\n`;
		sass += `}\n\n`;
		sass += `@mixin tf-dark-theme {\n`;
		sass += `  --tf-primary: #{$tf-primary-dark};\n`;
		sass += `  --tf-accent: #{$tf-accent-dark};\n`;
		sass += `  --tf-background: #{$tf-background-dark};\n`;
		sass += `  --tf-text: #{$tf-text-dark};\n`;
		sass += `}\n`;

		return sass;
	}

	// Generate Tailwind config export
	function generateTailwind() {
		const theme = currentTheme();
		const font = currentFont;
		if (!theme) return '';

		const config = {
			theme: {
				extend: {
					colors: {
						primary: {
							DEFAULT: theme.light.primary,
							shadow: theme.light.primaryShadow,
							dark: theme.dark.primary
						},
						accent: {
							DEFAULT: theme.light.accent,
							shadow: theme.light.accentShadow,
							dark: theme.dark.accent
						},
						background: {
							DEFAULT: theme.light.background,
							dark: theme.dark.background
						},
						card: {
							DEFAULT: theme.light.cardBackground,
							dark: theme.dark.cardBackground
						},
						content: {
							DEFAULT: theme.light.text,
							dark: theme.dark.text
						},
						extra: {
							DEFAULT: theme.light.extra,
							dark: theme.dark.extra
						}
					},
					...(includeFont && font
						? {
								fontFamily: {
									heading: [`'${font.heading}'`, 'system-ui', 'sans-serif'],
									body: [`'${font.body}'`, 'system-ui', 'sans-serif']
								}
							}
						: {})
				}
			}
		};

		let output = `// ThemeForseen Export: ${theme.name}\n`;
		output += `// Add this to your tailwind.config.js\n\n`;
		output += `module.exports = ${JSON.stringify(config, null, 2)};\n`;

		if (includeFont && font) {
			output += `\n// Don't forget to add Google Fonts to your HTML:\n`;
			const fonts = [font.heading, font.body].filter((f, i, a) => a.indexOf(f) === i);
			output += `// <link href="https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f.replace(/\s/g, '+')}:wght@400;500;600;700`).join('&')}&display=swap" rel="stylesheet">\n`;
		}

		return output;
	}

	// Generate JSON export
	function generateJSON() {
		const theme = currentTheme();
		const font = currentFont;
		if (!theme) return '';

		const output = {
			name: theme.name,
			colors: {
				light: theme.light,
				dark: theme.dark
			},
			...(includeFont && font
				? {
						fonts: {
							heading: font.heading,
							body: font.body,
							headingStyles: font.headingStyle,
							bodyStyles: font.bodyStyle
						}
					}
				: {})
		};

		return JSON.stringify(output, null, 2);
	}

	// Get export based on format
	const exportCode = $derived(() => {
		switch (selectedFormat) {
			case 'css':
				return generateCSS();
			case 'sass':
				return generateSass();
			case 'tailwind':
				return generateTailwind();
			case 'json':
				return generateJSON();
			default:
				return '';
		}
	});

	// File extension for download
	const fileExtension = $derived(() => {
		switch (selectedFormat) {
			case 'css':
				return 'css';
			case 'sass':
				return 'scss';
			case 'tailwind':
				return 'js';
			case 'json':
				return 'json';
			default:
				return 'txt';
		}
	});

	function copyToClipboard() {
		navigator.clipboard.writeText(exportCode());
		copied = true;
		toast.success('Copied to clipboard!');
		setTimeout(() => (copied = false), 2000);
	}

	function downloadFile() {
		const blob = new Blob([exportCode()], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `theme-${selectedPalette.toLowerCase().replace(/\s/g, '-')}.${fileExtension()}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('File downloaded!');
	}

	const formats: { id: ExportFormat; label: string; desc: string }[] = [
		{ id: 'css', label: 'CSS Variables', desc: 'Native CSS custom properties' },
		{ id: 'sass', label: 'Sass/SCSS', desc: 'Sass variables with mixins' },
		{ id: 'tailwind', label: 'Tailwind CSS', desc: 'Tailwind config extension' },
		{ id: 'json', label: 'JSON', desc: 'Raw theme data' }
	];
</script>

<svelte:head>
	<title>Export Theme - ThemeForseen</title>
	<meta name="description" content="Export your color themes as CSS, Sass, Tailwind, or JSON" />
</svelte:head>

<div class="max-w-5xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<FileCode class="w-8 h-8" />
			Export Theme
		</h1>
		<p class="text-muted-foreground mt-2">
			Export your selected theme in multiple formats
		</p>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Options Panel -->
		<div class="space-y-6">
			<!-- Palette Selector -->
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="text-base">Color Palette</Card.Title>
				</Card.Header>
				<Card.Content>
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
				</Card.Content>
			</Card.Root>

			<!-- Font Selector -->
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="text-base">Font Pairing</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="select-wrapper mb-3">
						<select bind:value={selectedFont} class="w-full">
							{#each fontPairings as font}
								<option value={font.name}>{font.name}</option>
							{/each}
						</select>
						<ChevronDown class="select-icon" />
					</div>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={includeFont} class="rounded" />
						Include fonts in export
					</label>
				</Card.Content>
			</Card.Root>

			<!-- Format Selector -->
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="text-base">Export Format</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-2">
						{#each formats as format}
							<label
								class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors {selectedFormat === format.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted'}"
							>
								<input
									type="radio"
									name="format"
									value={format.id}
									bind:group={selectedFormat}
									class="mt-0.5"
								/>
								<div>
									<div class="font-medium text-sm">{format.label}</div>
									<div class="text-xs text-muted-foreground">{format.desc}</div>
								</div>
							</label>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Code Preview -->
		<div class="lg:col-span-2">
			<Card.Root class="h-full flex flex-col">
				<Card.Header class="pb-3 flex-row items-center justify-between">
					<Card.Title class="text-base">
						{formats.find((f) => f.id === selectedFormat)?.label} Export
					</Card.Title>
					<div class="flex gap-2">
						<Button.Root variant="outline" size="sm" onclick={copyToClipboard} class="gap-2">
							{#if copied}
								<Check class="w-4 h-4" />
								Copied
							{:else}
								<Copy class="w-4 h-4" />
								Copy
							{/if}
						</Button.Root>
						<Button.Root size="sm" onclick={downloadFile} class="gap-2">
							<Download class="w-4 h-4" />
							Download
						</Button.Root>
					</div>
				</Card.Header>
				<Card.Content class="flex-1 pb-4">
					<pre class="code-preview">{exportCode()}</pre>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
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
		cursor: pointer;
	}

	.select-wrapper select:focus {
		outline: none;
		border-color: hsl(var(--primary));
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

	.code-preview {
		background: hsl(var(--muted));
		border-radius: 8px;
		padding: 1rem;
		font-family: 'Fira Code', 'SF Mono', Consolas, monospace;
		font-size: 0.8rem;
		line-height: 1.6;
		overflow: auto;
		height: 100%;
		min-height: 400px;
		max-height: 600px;
		white-space: pre;
		color: hsl(var(--foreground));
	}
</style>
