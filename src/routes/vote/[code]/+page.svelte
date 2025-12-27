<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { Check, FlaskConical } from 'lucide-svelte';
	import { colorThemes, fontPairings } from '$lib/themes';
	import { page } from '$app/stores';

	let { data } = $props();

	// State
	let hasVoted = $state(false);
	let votedFor = $state<'a' | 'b' | null>(null);
	let isVoting = $state(false);
	let votesA = $state(data.test.votesA);
	let votesB = $state(data.test.votesB);

	// Get palette colors
	function getPaletteColors(paletteName: string, customData: unknown | null) {
		if (customData) {
			return customData as { light: Record<string, string>; dark: Record<string, string> };
		}
		const theme = colorThemes.find((t) => t.name === paletteName);
		return theme || colorThemes[0];
	}

	const paletteA = $derived(getPaletteColors(data.test.variantAPalette, data.variantAPaletteData));
	const paletteB = $derived(getPaletteColors(data.test.variantBPalette, data.variantBPaletteData));

	// Get font data
	function getFontData(fontName: string | null) {
		if (!fontName) return null;
		return fontPairings.find((f) => f.name === fontName) || null;
	}

	const fontA = $derived(getFontData(data.test.variantAFont));
	const fontB = $derived(getFontData(data.test.variantBFont));

	async function vote(variant: 'a' | 'b') {
		if (hasVoted || isVoting) return;

		isVoting = true;

		try {
			const response = await fetch(`/api/ab-tests/${data.test.shareCode}/vote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ variant })
			});

			if (!response.ok) {
				const result = await response.json();
				if (response.status === 400 && result.message?.includes('already voted')) {
					hasVoted = true;
					return;
				}
				throw new Error(result.message || 'Vote failed');
			}

			const result = await response.json();
			votesA = result.votesA;
			votesB = result.votesB;
			hasVoted = true;
			votedFor = variant;
		} catch (err) {
			console.error('Vote error:', err);
			alert('Failed to submit vote. Please try again.');
		} finally {
			isVoting = false;
		}
	}

	function getPercentage(votes: number, total: number): number {
		if (total === 0) return 50;
		return Math.round((votes / total) * 100);
	}

	const total = $derived(votesA + votesB);
	const percentA = $derived(getPercentage(votesA, total));
	const percentB = $derived(getPercentage(votesB, total));
</script>

<svelte:head>
	<title>{data.test.name} - Vote | ThemeForseen</title>
	<meta name="description" content="Vote for your preferred theme variant" />
	<!-- Load fonts if specified -->
	{#if fontA}
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
		<link href="https://fonts.googleapis.com/css2?family={fontA.heading.replace(/ /g, '+')}:wght@400;600;700&family={fontA.body.replace(/ /g, '+')}:wght@400;500&display=swap" rel="stylesheet" />
	{/if}
	{#if fontB && (!fontA || fontB.name !== fontA.name)}
		<link href="https://fonts.googleapis.com/css2?family={fontB.heading.replace(/ /g, '+')}:wght@400;600;700&family={fontB.body.replace(/ /g, '+')}:wght@400;500&display=swap" rel="stylesheet" />
	{/if}
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-2 text-muted-foreground mb-2">
				<FlaskConical class="w-5 h-5" />
				<span class="text-sm">A/B Test</span>
			</div>
			<h1 class="text-2xl md:text-3xl font-bold">{data.test.name}</h1>
			{#if data.test.description}
				<p class="text-muted-foreground mt-2">{data.test.description}</p>
			{/if}
			<p class="text-sm text-muted-foreground mt-4">
				{#if hasVoted}
					Thanks for voting!
				{:else}
					Click on the design you prefer
				{/if}
			</p>
		</div>

		<!-- Voting Cards -->
		<div class="grid md:grid-cols-2 gap-6 mb-8">
			<!-- Variant A -->
			<button
				class="variant-card"
				class:voted={votedFor === 'a'}
				class:not-chosen={hasVoted && votedFor !== 'a'}
				disabled={hasVoted || isVoting}
				onclick={() => vote('a')}
				style="--bg: {paletteA.light.background}; --card: {paletteA.light.cardBackground}; --text: {paletteA.light.text}; --primary: {paletteA.light.primary}; --accent: {paletteA.light.accent}; --heading-font: {fontA?.heading || 'inherit'}; --body-font: {fontA?.body || 'inherit'};"
			>
				{#if votedFor === 'a'}
					<div class="voted-badge">
						<Check class="w-4 h-4" />
						Your choice
					</div>
				{/if}
				<div class="variant-label">{data.test.variantAName}</div>
				<div class="variant-preview">
					<div class="preview-header">
						<div class="logo">Logo</div>
						<nav class="preview-nav">
							<span>Home</span>
							<span>About</span>
							<span>Contact</span>
						</nav>
					</div>
					<div class="preview-hero">
						<h2>Welcome to Our Site</h2>
						<p>This is a sample preview showing how the theme would look on a real website.</p>
						<div class="preview-buttons">
							<span class="btn-primary">Get Started</span>
							<span class="btn-accent">Learn More</span>
						</div>
					</div>
					<div class="preview-cards">
						<div class="mini-card">
							<div class="card-title">Feature One</div>
							<div class="card-text">Description text here</div>
						</div>
						<div class="mini-card">
							<div class="card-title">Feature Two</div>
							<div class="card-text">Description text here</div>
						</div>
					</div>
				</div>
			</button>

			<!-- Variant B -->
			<button
				class="variant-card"
				class:voted={votedFor === 'b'}
				class:not-chosen={hasVoted && votedFor !== 'b'}
				disabled={hasVoted || isVoting}
				onclick={() => vote('b')}
				style="--bg: {paletteB.light.background}; --card: {paletteB.light.cardBackground}; --text: {paletteB.light.text}; --primary: {paletteB.light.primary}; --accent: {paletteB.light.accent}; --heading-font: {fontB?.heading || 'inherit'}; --body-font: {fontB?.body || 'inherit'};"
			>
				{#if votedFor === 'b'}
					<div class="voted-badge">
						<Check class="w-4 h-4" />
						Your choice
					</div>
				{/if}
				<div class="variant-label">{data.test.variantBName}</div>
				<div class="variant-preview">
					<div class="preview-header">
						<div class="logo">Logo</div>
						<nav class="preview-nav">
							<span>Home</span>
							<span>About</span>
							<span>Contact</span>
						</nav>
					</div>
					<div class="preview-hero">
						<h2>Welcome to Our Site</h2>
						<p>This is a sample preview showing how the theme would look on a real website.</p>
						<div class="preview-buttons">
							<span class="btn-primary">Get Started</span>
							<span class="btn-accent">Learn More</span>
						</div>
					</div>
					<div class="preview-cards">
						<div class="mini-card">
							<div class="card-title">Feature One</div>
							<div class="card-text">Description text here</div>
						</div>
						<div class="mini-card">
							<div class="card-title">Feature Two</div>
							<div class="card-text">Description text here</div>
						</div>
					</div>
				</div>
			</button>
		</div>

		<!-- Results (shown after voting) -->
		{#if hasVoted}
			<Card.Root class="max-w-xl mx-auto">
				<Card.Content class="py-6">
					<h3 class="font-semibold text-center mb-4">Current Results</h3>
					<div class="flex justify-between text-sm mb-2">
						<span class="font-medium text-blue-600 dark:text-blue-400">
							{data.test.variantAName}: {votesA} ({percentA}%)
						</span>
						<span class="font-medium text-orange-600 dark:text-orange-400">
							{data.test.variantBName}: {votesB} ({percentB}%)
						</span>
					</div>
					<div class="results-bar">
						<div class="bar-a" style="width: {percentA}%"></div>
						<div class="bar-b" style="width: {percentB}%"></div>
					</div>
					<p class="text-center text-sm text-muted-foreground mt-3">
						{total} total votes
					</p>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Footer -->
		<div class="text-center mt-8 text-sm text-muted-foreground">
			Powered by <a href="/" class="underline hover:text-foreground">ThemeForseen</a>
		</div>
	</div>
</div>

<style>
	.variant-card {
		position: relative;
		border: 2px solid hsl(var(--border));
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		background: transparent;
	}

	.variant-card:hover:not(:disabled) {
		border-color: hsl(var(--primary));
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.variant-card:disabled {
		cursor: default;
	}

	.variant-card.voted {
		border-color: hsl(142 76% 36%);
		box-shadow: 0 0 0 3px hsl(142 76% 36% / 0.2);
	}

	.variant-card.not-chosen {
		opacity: 0.6;
	}

	.voted-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: hsl(142 76% 36%);
		color: white;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		z-index: 10;
	}

	.variant-label {
		padding: 0.75rem 1rem;
		background: hsl(var(--muted));
		font-weight: 500;
		font-size: 0.875rem;
	}

	.variant-preview {
		background: var(--bg);
		color: var(--text);
		padding: 1.5rem;
		font-family: var(--body-font);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--text);
		opacity: 0.2;
	}

	.logo {
		font-family: var(--heading-font);
		font-weight: 700;
		color: var(--primary);
		opacity: 1;
	}

	.preview-nav {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
	}

	.preview-hero {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.preview-hero h2 {
		font-family: var(--heading-font);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--primary);
		margin-bottom: 0.5rem;
	}

	.preview-hero p {
		font-size: 0.8rem;
		opacity: 0.8;
		margin-bottom: 1rem;
	}

	.preview-buttons {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn-primary {
		padding: 0.4rem 0.8rem;
		background: var(--primary);
		color: var(--bg);
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.btn-accent {
		padding: 0.4rem 0.8rem;
		background: var(--accent);
		color: var(--bg);
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.preview-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.mini-card {
		background: var(--card);
		padding: 0.75rem;
		border-radius: 6px;
	}

	.card-title {
		font-family: var(--heading-font);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--primary);
		margin-bottom: 0.25rem;
	}

	.card-text {
		font-size: 0.65rem;
		opacity: 0.7;
	}

	.results-bar {
		display: flex;
		height: 24px;
		border-radius: 12px;
		overflow: hidden;
		background: hsl(var(--muted));
	}

	.bar-a {
		background: hsl(217 91% 60%);
		transition: width 0.3s ease;
	}

	.bar-b {
		background: hsl(25 95% 53%);
		transition: width 0.3s ease;
	}
</style>
