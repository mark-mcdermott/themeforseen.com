<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { FlaskConical, Plus, Trash2, Link, Copy, Check, ChevronDown, BarChart3, ExternalLink } from 'lucide-svelte';
	import { colorThemes, fontPairings } from 'theme-forseen';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	// State
	let showCreateForm = $state(false);
	let isCreating = $state(false);
	let copiedCode = $state<string | null>(null);

	// Form fields
	let testName = $state('');
	let testDescription = $state('');
	let variantAName = $state('Variant A');
	let variantAPalette = $state(colorThemes[0]?.name || '');
	let variantAFont = $state('');
	let variantBName = $state('Variant B');
	let variantBPalette = $state(colorThemes[1]?.name || colorThemes[0]?.name || '');
	let variantBFont = $state('');

	// All available palettes (built-in + custom)
	const allPalettes = $derived(() => {
		const builtIn = colorThemes.map((t) => ({ id: t.name, name: t.name, isCustom: false }));
		const custom = data.userPalettes.map((p) => ({ id: p.name, name: p.name, isCustom: true }));
		return [...builtIn, ...custom];
	});

	async function createTest() {
		if (!testName || !variantAPalette || !variantBPalette) {
			alert('Please fill in test name and select palettes for both variants');
			return;
		}

		isCreating = true;

		try {
			const response = await fetch('/api/ab-tests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: testName,
					description: testDescription || null,
					variantAName,
					variantAPalette,
					variantAFont: variantAFont || null,
					variantBName,
					variantBPalette,
					variantBFont: variantBFont || null
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create test');
			}

			// Reset form
			testName = '';
			testDescription = '';
			variantAName = 'Variant A';
			variantAPalette = colorThemes[0]?.name || '';
			variantAFont = '';
			variantBName = 'Variant B';
			variantBPalette = colorThemes[1]?.name || colorThemes[0]?.name || '';
			variantBFont = '';
			showCreateForm = false;

			await invalidateAll();
		} catch (err) {
			alert('Failed to create test');
		} finally {
			isCreating = false;
		}
	}

	async function deleteTest(id: string, name: string) {
		if (!confirm(`Delete test "${name}"?`)) return;

		try {
			const response = await fetch('/api/ab-tests', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});

			if (!response.ok) {
				throw new Error('Failed to delete');
			}

			await invalidateAll();
		} catch (err) {
			alert('Failed to delete test');
		}
	}

	function getVoteUrl(shareCode: string): string {
		const origin = typeof window !== 'undefined' ? window.location.origin : '';
		return `${origin}/vote/${shareCode}`;
	}

	async function copyLink(shareCode: string) {
		const url = getVoteUrl(shareCode);
		await navigator.clipboard.writeText(url);
		copiedCode = shareCode;
		setTimeout(() => {
			copiedCode = null;
		}, 2000);
	}

	function getPercentage(votes: number, total: number): number {
		if (total === 0) return 50;
		return Math.round((votes / total) * 100);
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>A/B Testing - ThemeForseen</title>
	<meta name="description" content="Create A/B tests to compare theme variants and gather feedback" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold flex items-center gap-3">
				<FlaskConical class="w-8 h-8" />
				A/B Testing
			</h1>
			<p class="text-muted-foreground mt-2">
				Compare theme variants and gather feedback from your audience
			</p>
		</div>
		{#if !showCreateForm}
			<Button.Root onclick={() => (showCreateForm = true)}>
				<Plus class="w-4 h-4 mr-2" />
				New Test
			</Button.Root>
		{/if}
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>Create New A/B Test</Card.Title>
				<Card.Description>
					Set up two theme variants to compare. Share the link to collect votes.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-6">
					<!-- Test Info -->
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<label for="test-name" class="text-sm font-medium block mb-1">Test Name *</label>
							<input
								id="test-name"
								type="text"
								bind:value={testName}
								placeholder="e.g., Homepage Color Test"
								class="input"
							/>
						</div>
						<div>
							<label for="test-desc" class="text-sm font-medium block mb-1">Description</label>
							<input
								id="test-desc"
								type="text"
								bind:value={testDescription}
								placeholder="Optional description"
								class="input"
							/>
						</div>
					</div>

					<!-- Variants -->
					<div class="grid md:grid-cols-2 gap-6">
						<!-- Variant A -->
						<div class="variant-card">
							<h3 class="font-medium mb-4 text-blue-600 dark:text-blue-400">Variant A</h3>
							<div class="space-y-3">
								<div>
									<label for="va-name" class="text-sm text-muted-foreground block mb-1">Label</label>
									<input
										id="va-name"
										type="text"
										bind:value={variantAName}
										class="input"
									/>
								</div>
								<div>
									<label for="va-palette" class="text-sm text-muted-foreground block mb-1">Palette *</label>
									<div class="select-wrapper">
										<select id="va-palette" bind:value={variantAPalette} class="input">
											<optgroup label="Built-in Palettes">
												{#each colorThemes as theme}
													<option value={theme.name}>{theme.name}</option>
												{/each}
											</optgroup>
											{#if data.userPalettes.length > 0}
												<optgroup label="Custom Palettes">
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
									<label for="va-font" class="text-sm text-muted-foreground block mb-1">Font Pairing</label>
									<div class="select-wrapper">
										<select id="va-font" bind:value={variantAFont} class="input">
											<option value="">Default</option>
											{#each fontPairings as font}
												<option value={font.name}>{font.name}</option>
											{/each}
										</select>
										<ChevronDown class="select-icon" />
									</div>
								</div>
							</div>
						</div>

						<!-- Variant B -->
						<div class="variant-card">
							<h3 class="font-medium mb-4 text-orange-600 dark:text-orange-400">Variant B</h3>
							<div class="space-y-3">
								<div>
									<label for="vb-name" class="text-sm text-muted-foreground block mb-1">Label</label>
									<input
										id="vb-name"
										type="text"
										bind:value={variantBName}
										class="input"
									/>
								</div>
								<div>
									<label for="vb-palette" class="text-sm text-muted-foreground block mb-1">Palette *</label>
									<div class="select-wrapper">
										<select id="vb-palette" bind:value={variantBPalette} class="input">
											<optgroup label="Built-in Palettes">
												{#each colorThemes as theme}
													<option value={theme.name}>{theme.name}</option>
												{/each}
											</optgroup>
											{#if data.userPalettes.length > 0}
												<optgroup label="Custom Palettes">
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
									<label for="vb-font" class="text-sm text-muted-foreground block mb-1">Font Pairing</label>
									<div class="select-wrapper">
										<select id="vb-font" bind:value={variantBFont} class="input">
											<option value="">Default</option>
											{#each fontPairings as font}
												<option value={font.name}>{font.name}</option>
											{/each}
										</select>
										<ChevronDown class="select-icon" />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="flex gap-3">
						<Button.Root onclick={createTest} disabled={isCreating}>
							{#if isCreating}
								Creating...
							{:else}
								Create Test
							{/if}
						</Button.Root>
						<Button.Root variant="outline" onclick={() => (showCreateForm = false)}>
							Cancel
						</Button.Root>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Tests List -->
	<div class="space-y-4">
		{#if data.tests.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center">
					<FlaskConical class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p class="text-muted-foreground">No A/B tests yet</p>
					<p class="text-sm text-muted-foreground mt-1">Create a test to start comparing theme variants</p>
				</Card.Content>
			</Card.Root>
		{:else}
			{#each data.tests as test}
				{@const total = test.votesA + test.votesB}
				{@const percentA = getPercentage(test.votesA, total)}
				{@const percentB = getPercentage(test.votesB, total)}
				<Card.Root>
					<Card.Content class="py-4">
						<div class="flex items-start justify-between mb-4">
							<div>
								<h3 class="font-semibold">{test.name}</h3>
								{#if test.description}
									<p class="text-sm text-muted-foreground">{test.description}</p>
								{/if}
								<p class="text-xs text-muted-foreground mt-1">Created {formatDate(test.createdAt)}</p>
							</div>
							<div class="flex items-center gap-2">
								<a
									href="/vote/{test.shareCode}"
									target="_blank"
									class="icon-btn"
									title="Preview voting page"
								>
									<ExternalLink class="w-4 h-4" />
								</a>
								<button
									class="icon-btn"
									onclick={() => copyLink(test.shareCode)}
									title="Copy share link"
								>
									{#if copiedCode === test.shareCode}
										<Check class="w-4 h-4 text-green-500" />
									{:else}
										<Copy class="w-4 h-4" />
									{/if}
								</button>
								<button
									class="icon-btn delete"
									onclick={() => deleteTest(test.id, test.name)}
									title="Delete test"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</div>

						<!-- Results Bar -->
						<div class="results-section">
							<div class="flex justify-between text-sm mb-2">
								<span class="font-medium text-blue-600 dark:text-blue-400">
									{test.variantAName}: {test.votesA} votes ({percentA}%)
								</span>
								<span class="font-medium text-orange-600 dark:text-orange-400">
									{test.variantBName}: {test.votesB} votes ({percentB}%)
								</span>
							</div>
							<div class="results-bar">
								<div class="bar-a" style="width: {percentA}%"></div>
								<div class="bar-b" style="width: {percentB}%"></div>
							</div>
							<div class="flex justify-between text-xs text-muted-foreground mt-2">
								<span>{test.variantAPalette}</span>
								<span>{total} total votes</span>
								<span>{test.variantBPalette}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		{/if}
	</div>

	<!-- How it works -->
	<Card.Root class="mt-8">
		<Card.Header>
			<Card.Title class="text-base">How A/B Testing Works</Card.Title>
		</Card.Header>
		<Card.Content>
			<ol class="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
				<li>Create a test with two theme variants (different palettes or fonts)</li>
				<li>Share the voting link with your audience, colleagues, or clients</li>
				<li>Voters see both variants side by side and pick their preference</li>
				<li>Track results in real-time to make data-driven design decisions</li>
			</ol>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #ccc;
		border-radius: 6px;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.select-wrapper {
		position: relative;
	}

	.select-wrapper select {
		appearance: none;
		padding-right: 2rem;
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

	.variant-card {
		padding: 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--muted) / 0.2);
	}

	.icon-btn {
		padding: 0.5rem;
		border: none;
		background: transparent;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.15s;
	}

	.icon-btn:hover {
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.icon-btn.delete:hover {
		background: hsl(0 84% 60% / 0.1);
		color: hsl(0 84% 60%);
	}

	.results-section {
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
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
