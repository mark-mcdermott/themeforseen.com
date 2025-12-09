<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { Heart, Palette, Type, Trash2, ExternalLink, RefreshCw, CloudUpload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { colorThemes, fontPairings } from 'theme-forseen';

	let { data } = $props();

	// Local favorites from the web component (can be multiple)
	let localLovedPalettes = $state<string[]>([]);
	let localLovedFonts = $state<string[]>([]);
	let syncing = $state(false);

	onMount(async () => {
		await invalidateAll();
		loadLocalFavorites();

		// Poll for localStorage changes while on the page (for real-time updates when hearting)
		const interval = setInterval(loadLocalFavorites, 1000);

		// Also listen for storage events from other tabs
		const handleStorage = () => loadLocalFavorites();
		window.addEventListener('storage', handleStorage);

		return () => {
			clearInterval(interval);
			window.removeEventListener('storage', handleStorage);
		};
	});

	function loadLocalFavorites() {
		// Read loved themes from localStorage (the web component stores arrays of indices)
		const lovedLightRaw = localStorage.getItem('themeforseen-loved-light');
		const lovedDarkRaw = localStorage.getItem('themeforseen-loved-dark');

		const palettes: string[] = [];

		// Parse light theme loved indices
		if (lovedLightRaw) {
			try {
				const indices = JSON.parse(lovedLightRaw) as number[];
				for (const idx of indices) {
					if (colorThemes[idx]) {
						palettes.push(colorThemes[idx].name);
					}
				}
			} catch { /* ignore parse errors */ }
		}

		// Parse dark theme loved indices
		if (lovedDarkRaw) {
			try {
				const indices = JSON.parse(lovedDarkRaw) as number[];
				for (const idx of indices) {
					if (colorThemes[idx] && !palettes.includes(colorThemes[idx].name)) {
						palettes.push(colorThemes[idx].name);
					}
				}
			} catch { /* ignore parse errors */ }
		}

		localLovedPalettes = palettes;

		// Read loved fonts (web component stores array of indices)
		const lovedFontsRaw = localStorage.getItem('themeforseen-loved-fonts');
		const fonts: string[] = [];

		if (lovedFontsRaw) {
			try {
				const indices = JSON.parse(lovedFontsRaw) as number[];
				for (const idx of indices) {
					if (fontPairings[idx]) {
						fonts.push(fontPairings[idx].name);
					}
				}
			} catch { /* ignore parse errors */ }
		}

		localLovedFonts = fonts;
	}

	async function syncToCloud() {
		syncing = true;
		let synced = 0;

		try {
			// Sync palettes if not already saved
			for (const paletteName of localLovedPalettes) {
				const existing = data.palettes.find((p: { paletteName: string }) => p.paletteName === paletteName);
				if (!existing) {
					const res = await fetch('/api/favorites/palettes', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ paletteName })
					});
					if (res.ok) synced++;
				}
			}

			// Sync fonts if not already saved
			for (const pairingName of localLovedFonts) {
				const existing = data.fontPairings.find((f: { pairingName: string }) => f.pairingName === pairingName);
				if (!existing) {
					const res = await fetch('/api/favorites/fonts', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ pairingName })
					});
					if (res.ok) synced++;
				}
			}

			if (synced > 0) {
				toast.success(`Synced ${synced} favorite${synced > 1 ? 's' : ''} to cloud`);
				await invalidateAll();
			} else {
				toast.info('All local favorites already synced');
			}
		} catch {
			toast.error('Failed to sync favorites');
		} finally {
			syncing = false;
		}
	}

	async function deletePalette(paletteName: string) {
		try {
			const res = await fetch('/api/favorites/palettes', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ paletteName })
			});

			if (!res.ok) {
				throw new Error('Failed to delete');
			}

			toast.success('Palette removed from favorites');
			await invalidateAll();
		} catch {
			toast.error('Failed to remove palette');
		}
	}

	async function deleteFontPairing(pairingName: string) {
		try {
			const res = await fetch('/api/favorites/fonts', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pairingName })
			});

			if (!res.ok) {
				throw new Error('Failed to delete');
			}

			toast.success('Font pairing removed from favorites');
			await invalidateAll();
		} catch {
			toast.error('Failed to remove font pairing');
		}
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Check if local favorites are already synced
	const unsyncedPalettes = $derived(
		localLovedPalettes.filter(name => !data.palettes.find((p: { paletteName: string }) => p.paletteName === name))
	);
	const unsyncedFonts = $derived(
		localLovedFonts.filter(name => !data.fontPairings.find((f: { pairingName: string }) => f.pairingName === name))
	);
	const hasUnsyncedFavorites = $derived(unsyncedPalettes.length > 0 || unsyncedFonts.length > 0);
	const hasLocalFavorites = $derived(localLovedPalettes.length > 0 || localLovedFonts.length > 0);
</script>

<svelte:head>
	<title>Favorites - ThemeForseen</title>
	<meta name="description" content="Your saved color palettes and font pairings" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Heart class="w-8 h-8 text-red-500" />
			Favorites
		</h1>
		<p class="text-muted-foreground mt-2">
			Your saved color palettes and font pairings
		</p>
	</div>

	<!-- Sync from Device -->
	{#if hasLocalFavorites}
		<section class="mb-8">
			<Card.Root class="border-dashed">
				<Card.Header class="pb-3">
					<Card.Title class="text-base flex items-center gap-2">
						<RefreshCw class="w-4 h-4" />
						Local Favorites
					</Card.Title>
					<Card.Description>
						Favorites from your current device that can be synced to the cloud
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-2 mb-4">
						{#each localLovedPalettes as paletteName}
							<div class="flex items-center gap-2 text-sm">
								<Palette class="w-4 h-4 text-muted-foreground" />
								<span>{paletteName}</span>
								{#if !unsyncedPalettes.includes(paletteName)}
									<span class="text-xs text-green-600">(synced)</span>
								{/if}
							</div>
						{/each}
						{#each localLovedFonts as fontName}
							<div class="flex items-center gap-2 text-sm">
								<Type class="w-4 h-4 text-muted-foreground" />
								<span>{fontName}</span>
								{#if !unsyncedFonts.includes(fontName)}
									<span class="text-xs text-green-600">(synced)</span>
								{/if}
							</div>
						{/each}
					</div>
					{#if hasUnsyncedFavorites}
						<Button.Root
							onclick={syncToCloud}
							disabled={syncing}
							size="sm"
							class="gap-2"
						>
							<CloudUpload class="w-4 h-4" />
							{syncing ? 'Syncing...' : 'Sync to Cloud'}
						</Button.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<!-- Saved Palettes -->
	<section class="mb-12">
		<h2 class="text-xl font-semibold flex items-center gap-2 mb-4">
			<Palette class="w-5 h-5" />
			Color Palettes
			<span class="text-sm font-normal text-muted-foreground">({data.palettes.length})</span>
		</h2>

		{#if data.palettes.length === 0}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					<Palette class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p>No saved palettes yet</p>
					<p class="text-sm mt-1">Use the theme sidebar and click the heart icon on a palette to save it</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-4">
				{#each data.palettes as palette}
					<Card.Root>
						<Card.Content class="py-4">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<h3 class="font-medium">{palette.paletteName}</h3>
									{#if palette.notes}
										<p class="text-sm text-muted-foreground mt-1">{palette.notes}</p>
									{/if}
									<p class="text-xs text-muted-foreground mt-2">
										Saved {formatDate(palette.createdAt)}
									</p>
								</div>
								<div class="flex items-center gap-2">
									<a
										href="/?palette={encodeURIComponent(palette.paletteName)}"
										class="p-2 hover:bg-muted rounded transition-colors"
										title="Preview palette"
									>
										<ExternalLink class="w-4 h-4" />
									</a>
									<button
										onclick={() => deletePalette(palette.paletteName)}
										class="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
										title="Remove from favorites"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Saved Font Pairings -->
	<section>
		<h2 class="text-xl font-semibold flex items-center gap-2 mb-4">
			<Type class="w-5 h-5" />
			Font Pairings
			<span class="text-sm font-normal text-muted-foreground">({data.fontPairings.length})</span>
		</h2>

		{#if data.fontPairings.length === 0}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					<Type class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p>No saved font pairings yet</p>
					<p class="text-sm mt-1">Use the theme sidebar and click the heart icon on a font to save it</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-4">
				{#each data.fontPairings as pairing}
					<Card.Root>
						<Card.Content class="py-4">
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<h3 class="font-medium">{pairing.pairingName}</h3>
									{#if pairing.notes}
										<p class="text-sm text-muted-foreground mt-1">{pairing.notes}</p>
									{/if}
									<p class="text-xs text-muted-foreground mt-2">
										Saved {formatDate(pairing.createdAt)}
									</p>
								</div>
								<div class="flex items-center gap-2">
									<a
										href="/?font={encodeURIComponent(pairing.pairingName)}"
										class="p-2 hover:bg-muted rounded transition-colors"
										title="Preview font pairing"
									>
										<ExternalLink class="w-4 h-4" />
									</a>
									<button
										onclick={() => deleteFontPairing(pairing.pairingName)}
										class="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
										title="Remove from favorites"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>
</div>
