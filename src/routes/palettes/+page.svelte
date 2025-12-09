<script lang="ts">
	import { Card, Button, Input, Label } from '$lib/components/ui';
	import { Palette, Plus, Trash2, Edit2, X, Check, Sun, Moon } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	// Editor state
	let isCreating = $state(false);
	let editingId = $state<string | null>(null);
	let previewMode = $state<'light' | 'dark'>('light');
	let nameError = $state('');

	// Form state
	let name = $state('');
	let light = $state({
		primary: '#0066CC',
		primaryShadow: '#004C99',
		accent: '#FF6B35',
		accentShadow: '#CC5529',
		background: '#FFFFFF',
		cardBackground: '#F5F5F5',
		text: '#333333',
		extra: '#00D4FF',
		h1Color: 'primary' as const,
		h2Color: 'primary' as const,
		h3Color: 'accent' as const
	});
	let dark = $state({
		primary: '#3399FF',
		primaryShadow: '#0066CC',
		accent: '#FF8C5A',
		accentShadow: '#FF6B35',
		background: '#1A1A1A',
		cardBackground: '#2A2A2A',
		text: '#E0E0E0',
		extra: '#00D4FF',
		h1Color: 'primary' as const,
		h2Color: 'primary' as const,
		h3Color: 'accent' as const
	});

	function resetForm() {
		name = '';
		nameError = '';
		light = {
			primary: '#0066CC',
			primaryShadow: '#004C99',
			accent: '#FF6B35',
			accentShadow: '#CC5529',
			background: '#FFFFFF',
			cardBackground: '#F5F5F5',
			text: '#333333',
			extra: '#00D4FF',
			h1Color: 'primary',
			h2Color: 'primary',
			h3Color: 'accent'
		};
		dark = {
			primary: '#3399FF',
			primaryShadow: '#0066CC',
			accent: '#FF8C5A',
			accentShadow: '#FF6B35',
			background: '#1A1A1A',
			cardBackground: '#2A2A2A',
			text: '#E0E0E0',
			extra: '#00D4FF',
			h1Color: 'primary',
			h2Color: 'primary',
			h3Color: 'accent'
		};
	}

	function startCreate() {
		resetForm();
		isCreating = true;
		editingId = null;
	}

	function startEdit(palette: typeof data.palettes[0]) {
		name = palette.name;
		light = { ...palette.light as typeof light };
		dark = { ...palette.dark as typeof dark };
		editingId = palette.id;
		isCreating = false;
	}

	function cancelEdit() {
		isCreating = false;
		editingId = null;
		resetForm();
	}

	async function savePalette() {
		nameError = '';

		if (!name.trim()) {
			nameError = 'Please enter a palette name';
			document.getElementById('palette-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			document.getElementById('palette-name')?.focus();
			return;
		}

		try {
			const endpoint = '/api/palettes';
			const method = editingId ? 'PUT' : 'POST';
			const body = editingId
				? { id: editingId, name, light, dark }
				: { name, light, dark };

			const res = await fetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to save');
			}

			toast.success(editingId ? 'Palette updated!' : 'Palette created!');
			cancelEdit();
			await invalidateAll();
		} catch (e) {
			toast.error((e as Error).message);
		}
	}

	async function deletePalette(id: string) {
		if (!confirm('Delete this palette?')) return;

		try {
			const res = await fetch('/api/palettes', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});

			if (!res.ok) throw new Error('Failed to delete');

			toast.success('Palette deleted');
			await invalidateAll();
		} catch {
			toast.error('Failed to delete palette');
		}
	}

	// Computed preview colors based on mode
	const previewColors = $derived(previewMode === 'light' ? light : dark);

	// Get the actual color value for heading colors
	function getHeadingColor(colorKey: 'primary' | 'accent' | 'text') {
		return previewColors[colorKey === 'text' ? 'text' : colorKey];
	}

	const colorFields = [
		{ key: 'primary', label: 'Primary' },
		{ key: 'primaryShadow', label: 'Primary Shadow' },
		{ key: 'accent', label: 'Accent' },
		{ key: 'accentShadow', label: 'Accent Shadow' },
		{ key: 'background', label: 'Background' },
		{ key: 'cardBackground', label: 'Card Background' },
		{ key: 'text', label: 'Text' },
		{ key: 'extra', label: 'Extra' }
	] as const;

	const headingColorOptions = ['primary', 'accent', 'text'] as const;
</script>

<svelte:head>
	<title>Custom Palettes - ThemeForseen</title>
	<meta name="description" content="Create and manage your custom color palettes" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-12">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold flex items-center gap-3">
				<Palette class="w-8 h-8" />
				Custom Palettes
			</h1>
			<p class="text-muted-foreground mt-2">
				Create your own color palettes
			</p>
		</div>
		{#if !isCreating && !editingId}
			<Button.Root onclick={startCreate} class="gap-2">
				<Plus class="w-4 h-4" />
				New Palette
			</Button.Root>
		{/if}
	</div>

	<!-- Editor -->
	{#if isCreating || editingId}
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>{editingId ? 'Edit Palette' : 'Create New Palette'}</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-6">
					<!-- Name -->
					<div>
						<Label.Root for="palette-name">Palette Name</Label.Root>
						<Input.Root
							id="palette-name"
							bind:value={name}
							placeholder="My Custom Palette"
							class="max-w-sm mt-1 {nameError ? 'border-red-500' : ''}"
							oninput={() => nameError = ''}
						/>
						{#if nameError}
							<p class="text-sm text-red-500 mt-1">{nameError}</p>
						{/if}
					</div>

					<!-- Mode Toggle -->
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">Editing:</span>
						<button
							onclick={() => (previewMode = 'light')}
							class="px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors {previewMode === 'light' ? 'bg-foreground text-background' : 'bg-muted'}"
						>
							<Sun class="w-4 h-4" />
							Light
						</button>
						<button
							onclick={() => (previewMode = 'dark')}
							class="px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors {previewMode === 'dark' ? 'bg-foreground text-background' : 'bg-muted'}"
						>
							<Moon class="w-4 h-4" />
							Dark
						</button>
					</div>

					<div class="grid lg:grid-cols-2 gap-8">
						<!-- Color Pickers -->
						<div class="space-y-4">
							<h3 class="font-medium">{previewMode === 'light' ? 'Light' : 'Dark'} Mode Colors</h3>
							<div class="grid grid-cols-2 gap-4">
								{#each colorFields as field}
									<div>
										<Label.Root for={field.key} class="text-sm">{field.label}</Label.Root>
										<div class="flex items-center gap-2 mt-1">
											<input
												type="color"
												id={field.key}
												value={previewMode === 'light' ? light[field.key] : dark[field.key]}
												onchange={(e) => {
													if (previewMode === 'light') {
														light[field.key] = e.currentTarget.value;
													} else {
														dark[field.key] = e.currentTarget.value;
													}
												}}
												class="w-10 h-10 rounded border cursor-pointer"
											/>
											<Input.Root
												value={previewMode === 'light' ? light[field.key] : dark[field.key]}
												onchange={(e) => {
													const val = e.currentTarget.value;
													if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
														if (previewMode === 'light') {
															light[field.key] = val;
														} else {
															dark[field.key] = val;
														}
													}
												}}
												class="font-mono text-sm flex-1"
											/>
										</div>
									</div>
								{/each}
							</div>

							<!-- Heading Colors -->
							<div class="pt-4 border-t">
								<h4 class="font-medium mb-3">Heading Colors</h4>
								<div class="grid grid-cols-3 gap-4">
									{#each ['h1Color', 'h2Color', 'h3Color'] as headingKey}
										<div>
											<Label.Root class="text-sm">{headingKey.replace('Color', '').toUpperCase()}</Label.Root>
											<select
												value={previewMode === 'light' ? light[headingKey as keyof typeof light] : dark[headingKey as keyof typeof dark]}
												onchange={(e) => {
													const val = e.currentTarget.value as 'primary' | 'accent' | 'text';
													if (previewMode === 'light') {
														(light as Record<string, unknown>)[headingKey] = val;
													} else {
														(dark as Record<string, unknown>)[headingKey] = val;
													}
												}}
												class="w-full mt-1 px-3 py-2 rounded border bg-background text-sm"
											>
												{#each headingColorOptions as opt}
													<option value={opt}>{opt}</option>
												{/each}
											</select>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<!-- Live Preview -->
						<div>
							<h3 class="font-medium mb-3">Preview</h3>
							<div
								class="rounded-lg p-6 border"
								style="background: {previewColors.background}; color: {previewColors.text};"
							>
								<h1 style="color: {getHeadingColor(previewColors.h1Color)}; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
									Heading One
								</h1>
								<h2 style="color: {getHeadingColor(previewColors.h2Color)}; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
									Heading Two
								</h2>
								<h3 style="color: {getHeadingColor(previewColors.h3Color)}; font-size: 1rem; font-weight: 500; margin-bottom: 1rem;">
									Heading Three
								</h3>
								<p style="margin-bottom: 1rem;">
									This is body text. It should be easy to read against the background.
								</p>
								<div
									class="rounded p-4 mb-4"
									style="background: {previewColors.cardBackground};"
								>
									<p>This is a card with a different background.</p>
								</div>
								<div class="flex gap-2">
									<button
										class="px-4 py-2 rounded font-medium"
										style="background: {previewColors.primary}; color: {previewColors.background};"
									>
										Primary Button
									</button>
									<button
										class="px-4 py-2 rounded font-medium"
										style="background: {previewColors.accent}; color: {previewColors.background};"
									>
										Accent Button
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex items-center gap-3 pt-4 border-t">
						<Button.Root onclick={savePalette} class="gap-2">
							<Check class="w-4 h-4" />
							{editingId ? 'Save Changes' : 'Create Palette'}
						</Button.Root>
						<Button.Root variant="outline" onclick={cancelEdit} class="gap-2">
							<X class="w-4 h-4" />
							Cancel
						</Button.Root>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Palette List -->
	<section>
		<h2 class="text-xl font-semibold mb-4">
			Your Palettes
			<span class="text-sm font-normal text-muted-foreground">({data.palettes.length})</span>
		</h2>

		{#if data.palettes.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<Palette class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p>No custom palettes yet</p>
					<p class="text-sm mt-1">Click "New Palette" to create your first one</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.palettes as palette}
					{@const colors = palette.light as typeof light}
					<Card.Root class="overflow-hidden">
						<!-- Color Preview Swatches -->
						<div class="h-16 flex">
							<div class="flex-1" style="background: {colors.primary};"></div>
							<div class="flex-1" style="background: {colors.accent};"></div>
							<div class="flex-1" style="background: {colors.background};"></div>
							<div class="flex-1" style="background: {colors.text};"></div>
						</div>
						<Card.Content class="pt-4">
							<div class="flex items-center justify-between">
								<h3 class="font-medium">{palette.name}</h3>
								<div class="flex items-center gap-1">
									<button
										onclick={() => startEdit(palette)}
										class="p-2 hover:bg-muted rounded transition-colors"
										title="Edit palette"
									>
										<Edit2 class="w-4 h-4" />
									</button>
									<button
										onclick={() => deletePalette(palette.id)}
										class="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
										title="Delete palette"
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
