<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { Type, Upload, Trash2, AlertCircle, Check, ChevronDown } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	// State
	let isDragging = $state(false);
	let isUploading = $state(false);
	let uploadError = $state<string | null>(null);
	let uploadSuccess = $state<string | null>(null);

	// Form fields
	let fontName = $state('');
	let fontFamily = $state('');
	let fontWeight = $state('400');
	let fontStyle = $state('normal');
	let selectedFile = $state<File | null>(null);

	const weights = [
		{ value: '100', label: 'Thin (100)' },
		{ value: '200', label: 'Extra Light (200)' },
		{ value: '300', label: 'Light (300)' },
		{ value: '400', label: 'Regular (400)' },
		{ value: '500', label: 'Medium (500)' },
		{ value: '600', label: 'Semi Bold (600)' },
		{ value: '700', label: 'Bold (700)' },
		{ value: '800', label: 'Extra Bold (800)' },
		{ value: '900', label: 'Black (900)' }
	];

	const styles = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'italic', label: 'Italic' }
	];

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files?.length) {
			handleFileSelect(files[0]);
		}
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.length) {
			handleFileSelect(input.files[0]);
		}
	}

	function handleFileSelect(file: File) {
		const validExtensions = ['.woff2', '.woff', '.ttf', '.otf'];
		const ext = '.' + file.name.split('.').pop()?.toLowerCase();

		if (!validExtensions.includes(ext)) {
			uploadError = 'Invalid file type. Allowed: WOFF2, WOFF, TTF, OTF';
			return;
		}

		if (file.size > 500 * 1024) {
			uploadError = 'File too large. Maximum size: 500KB';
			return;
		}

		selectedFile = file;
		uploadError = null;

		// Auto-fill name and family from filename
		const baseName = file.name.replace(/\.[^/.]+$/, '');
		if (!fontName) fontName = baseName;
		if (!fontFamily) fontFamily = baseName.replace(/[-_]/g, ' ');
	}

	async function uploadFont() {
		if (!selectedFile || !fontName || !fontFamily) {
			uploadError = 'Please fill in all required fields';
			return;
		}

		isUploading = true;
		uploadError = null;
		uploadSuccess = null;

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);
			formData.append('name', fontName);
			formData.append('family', fontFamily);
			formData.append('weight', fontWeight);
			formData.append('style', fontStyle);

			const response = await fetch('/api/fonts', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Upload failed');
			}

			uploadSuccess = `"${fontName}" uploaded successfully!`;

			// Reset form
			selectedFile = null;
			fontName = '';
			fontFamily = '';
			fontWeight = '400';
			fontStyle = 'normal';

			// Refresh data
			await invalidateAll();
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			isUploading = false;
		}
	}

	async function deleteFont(id: string, name: string) {
		if (!confirm(`Delete font "${name}"?`)) return;

		try {
			const response = await fetch('/api/fonts', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id })
			});

			if (!response.ok) {
				throw new Error('Delete failed');
			}

			await invalidateAll();
		} catch (err) {
			alert('Failed to delete font');
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		return (bytes / 1024).toFixed(1) + ' KB';
	}

	// Generate @font-face CSS for preview
	function getFontFaceCSS(font: typeof data.userFonts[0]): string {
		return `@font-face {
  font-family: '${font.family}';
  src: url('/api/fonts/${font.id}') format('${font.format === 'ttf' ? 'truetype' : font.format === 'otf' ? 'opentype' : font.format}');
  font-weight: ${font.weight};
  font-style: ${font.style};
}`;
	}
</script>

<svelte:head>
	<title>Custom Fonts - ThemeForseen</title>
	<meta name="description" content="Upload and manage your custom fonts" />
	{#each data.userFonts as font}
		<style>
			{@html getFontFaceCSS(font)}
		</style>
	{/each}
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Type class="w-8 h-8" />
			Custom Fonts
		</h1>
		<p class="text-muted-foreground mt-2">
			Upload your own font files to use in the Site Previewer and exports
		</p>
	</div>

	<!-- Upload Section -->
	<Card.Root class="mb-8">
		<Card.Header>
			<Card.Title>Upload Font</Card.Title>
			<Card.Description>
				Supports WOFF2, WOFF, TTF, and OTF formats. Maximum 500KB per file, up to 10 fonts.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<!-- Drop Zone -->
			<div
				class="drop-zone"
				class:dragging={isDragging}
				class:has-file={selectedFile}
				role="button"
				tabindex="0"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				onclick={() => document.getElementById('font-input')?.click()}
				onkeypress={(e) => e.key === 'Enter' && document.getElementById('font-input')?.click()}
			>
				<input
					type="file"
					id="font-input"
					accept=".woff2,.woff,.ttf,.otf"
					onchange={handleFileInput}
					hidden
				/>
				{#if selectedFile}
					<div class="file-info">
						<Type class="w-8 h-8 text-primary" />
						<div>
							<p class="font-medium">{selectedFile.name}</p>
							<p class="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
						</div>
					</div>
				{:else}
					<Upload class="w-10 h-10 text-muted-foreground mb-2" />
					<p class="text-muted-foreground">Drag & drop a font file or click to browse</p>
					<p class="text-sm text-muted-foreground mt-1">WOFF2, WOFF, TTF, OTF</p>
				{/if}
			</div>

			<!-- Form Fields -->
			{#if selectedFile}
				<div class="grid md:grid-cols-2 gap-4 mt-4">
					<div>
						<label for="font-name" class="text-sm font-medium block mb-1">Display Name *</label>
						<input
							id="font-name"
							type="text"
							bind:value={fontName}
							placeholder="My Custom Font"
							class="input"
						/>
					</div>
					<div>
						<label for="font-family" class="text-sm font-medium block mb-1">Font Family *</label>
						<input
							id="font-family"
							type="text"
							bind:value={fontFamily}
							placeholder="MyCustomFont"
							class="input"
						/>
					</div>
					<div>
						<label for="font-weight" class="text-sm font-medium block mb-1">Weight</label>
						<div class="select-wrapper">
							<select id="font-weight" bind:value={fontWeight} class="input">
								{#each weights as w}
									<option value={w.value}>{w.label}</option>
								{/each}
							</select>
							<ChevronDown class="select-icon" />
						</div>
					</div>
					<div>
						<label for="font-style" class="text-sm font-medium block mb-1">Style</label>
						<div class="select-wrapper">
							<select id="font-style" bind:value={fontStyle} class="input">
								{#each styles as s}
									<option value={s.value}>{s.label}</option>
								{/each}
							</select>
							<ChevronDown class="select-icon" />
						</div>
					</div>
				</div>

				<div class="mt-4 flex gap-3">
					<Button.Root onclick={uploadFont} disabled={isUploading}>
						{#if isUploading}
							Uploading...
						{:else}
							<Upload class="w-4 h-4 mr-2" />
							Upload Font
						{/if}
					</Button.Root>
					<Button.Root variant="outline" onclick={() => { selectedFile = null; fontName = ''; fontFamily = ''; }}>
						Cancel
					</Button.Root>
				</div>
			{/if}

			<!-- Messages -->
			{#if uploadError}
				<div class="message error mt-4">
					<AlertCircle class="w-4 h-4" />
					{uploadError}
				</div>
			{/if}

			{#if uploadSuccess}
				<div class="message success mt-4">
					<Check class="w-4 h-4" />
					{uploadSuccess}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Font List -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Your Fonts ({data.userFonts.length}/10)</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.userFonts.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					<Type class="w-12 h-12 mx-auto mb-3 opacity-50" />
					<p>No custom fonts uploaded yet</p>
					<p class="text-sm mt-1">Upload a font to get started</p>
				</div>
			{:else}
				<div class="font-list">
					{#each data.userFonts as font}
						<div class="font-item">
							<div class="font-preview" style="font-family: '{font.family}';">
								Aa Bb Cc 123
							</div>
							<div class="font-details">
								<div class="font-name">{font.name}</div>
								<div class="font-meta">
									<span>{font.family}</span>
									<span class="dot">•</span>
									<span>{weights.find(w => w.value === font.weight)?.label || font.weight}</span>
									{#if font.style === 'italic'}
										<span class="dot">•</span>
										<span>Italic</span>
									{/if}
									<span class="dot">•</span>
									<span>{font.format.toUpperCase()}</span>
									<span class="dot">•</span>
									<span>{formatFileSize(font.fileSize)}</span>
								</div>
							</div>
							<button
								class="delete-btn"
								onclick={() => deleteFont(font.id, font.name)}
								title="Delete font"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Usage Info -->
	<Card.Root class="mt-8">
		<Card.Header>
			<Card.Title class="text-base">How to Use Custom Fonts</Card.Title>
		</Card.Header>
		<Card.Content>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li>1. Upload your font file (WOFF2 recommended for best performance)</li>
				<li>2. Your fonts will appear in the Site Previewer font selector</li>
				<li>3. When exporting, the CSS will include @font-face rules for your custom fonts</li>
				<li>4. Include the font files in your project when deploying</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.drop-zone {
		border: 2px dashed hsl(var(--border));
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.drop-zone:hover,
	.drop-zone.dragging {
		border-color: hsl(var(--primary));
		background: hsl(var(--primary) / 0.05);
	}

	.drop-zone.has-file {
		border-style: solid;
		border-color: hsl(var(--primary));
	}

	.file-info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid hsl(var(--border));
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

	.message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.message.error {
		background: hsl(0 84% 60% / 0.1);
		color: hsl(0 84% 60%);
	}

	.message.success {
		background: hsl(142 76% 36% / 0.1);
		color: hsl(142 76% 36%);
	}

	.font-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.font-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		transition: background 0.15s;
	}

	.font-item:hover {
		background: hsl(var(--muted) / 0.3);
	}

	.font-preview {
		width: 120px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: hsl(var(--muted));
		border-radius: 6px;
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.font-details {
		flex: 1;
		min-width: 0;
	}

	.font-name {
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.font-meta {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}

	.dot {
		opacity: 0.5;
	}

	.delete-btn {
		padding: 0.5rem;
		border: none;
		background: transparent;
		color: hsl(var(--muted-foreground));
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.15s;
	}

	.delete-btn:hover {
		background: hsl(0 84% 60% / 0.1);
		color: hsl(0 84% 60%);
	}
</style>
