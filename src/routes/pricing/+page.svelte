<script lang="ts">
	import { Check, X, Sparkles, Zap } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let { data } = $props();
	let loading = $state(false);

	onMount(() => {
		const payment = $page.url.searchParams.get('payment');
		if (payment === 'cancelled') {
			toast.error('Payment was cancelled');
		}
	});

	async function handleUpgrade() {
		if (!data.user) {
			window.location.href = '/login?redirect=/pricing';
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to start checkout');
			}

			const { url } = await response.json();
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
			loading = false;
		}
	}

	const freeFeatures = [
		{ text: '50+ curated color palettes', included: true },
		{ text: '80+ Google Font pairings', included: true },
		{ text: 'Live preview tool', included: true },
		{ text: 'Light & dark mode support', included: true },
		{ text: 'Keyboard or mouse scrollwheel navigation', included: true },
		{ text: 'Basic CSS export', included: true },
		{ text: 'Save favorites', included: false },
		{ text: 'Custom palettes', included: false },
		{ text: 'All export formats', included: false },
		{ text: 'Accessibility tools', included: false }
	];

	const premiumFeatures = [
		{ text: 'Everything in Free', included: true },
		{ text: 'Save unlimited favorites', included: true },
		{ text: 'Create custom palettes', included: true },
		{ text: 'Upload custom fonts', included: true },
		{ text: 'All export formats (CSS, Sass, Tailwind, JSON)', included: true },
		{ text: 'Brand color extraction', included: true },
		{ text: 'Accessibility checker (WCAG)', included: true },
		{ text: 'Color blindness simulator', included: true },
		{ text: 'Full site theme previewer', included: true }
	];
</script>

<svelte:head>
	<title>Pricing - ThemeForseen</title>
	<meta name="description" content="ThemeForseen pricing - Free forever or unlock premium features" />
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-16">
	<div class="text-center mb-16">
		<h1 class="mb-4">Simple, Fair Pricing</h1>
		<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
			The free version is fully functional for everyone. Premium unlocks power features for those who want more.
		</p>
	</div>

	<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
		<!-- Free Tier -->
		<div class="border rounded-xl p-8 bg-card">
			<div class="mb-6">
				<h2 class="text-2xl font-bold mb-2">Free</h2>
				<p class="text-muted-foreground">For everyone, forever</p>
			</div>

			<div class="mb-8">
				<span class="text-5xl font-bold">$0</span>
			</div>

			<a
				href="/getting-started"
				class="block w-full py-3 px-4 text-center rounded-lg border-2 border-foreground/20 hover:border-foreground/40 transition-colors font-medium"
			>
				Get Started
			</a>

			<ul class="mt-8 space-y-3">
				{#each freeFeatures as feature}
					<li class="flex items-start gap-3">
						{#if feature.included}
							<Check class="size-5 text-green-500 shrink-0 mt-0.5" />
							<span>{feature.text}</span>
						{:else}
							<X class="size-5 text-muted-foreground/50 shrink-0 mt-0.5" />
							<span class="text-muted-foreground/50">{feature.text}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>

		<!-- Premium Tier -->
		<div class="border-2 border-[var(--primary-color,#51c5f4)] rounded-xl p-8 bg-card relative">
			<div class="absolute -top-3 left-1/2 -translate-x-1/2">
				<span class="bg-[var(--primary-color,#51c5f4)] text-black px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
					<Sparkles class="size-4" />
					Best Value
				</span>
			</div>

			<div class="mb-6">
				<h2 class="text-2xl font-bold mb-2">Premium</h2>
				<p class="text-muted-foreground">One-time purchase, forever yours</p>
			</div>

			<div class="mb-8">
				<span class="text-5xl font-bold">$5</span>
				<span class="text-muted-foreground ml-2">one-time</span>
			</div>

			{#if data.user?.isPremium}
				<div class="w-full py-3 px-4 text-center rounded-lg bg-green-500/10 text-green-600 font-medium flex items-center justify-center gap-2">
					<Check class="size-5" />
					You have Premium
				</div>
			{:else}
				<button
					onclick={handleUpgrade}
					disabled={loading}
					class="w-full py-3 px-4 text-center rounded-lg bg-[var(--primary-color,#51c5f4)] text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
				>
					{#if loading}
						<span class="animate-spin">⏳</span>
						Processing...
					{:else}
						<Zap class="size-5" />
						Upgrade to Premium
					{/if}
				</button>
			{/if}

			<ul class="mt-8 space-y-3">
				{#each premiumFeatures as feature}
					<li class="flex items-start gap-3">
						<Check class="size-5 text-green-500 shrink-0 mt-0.5" />
						<span>{feature.text}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="mt-16 text-center">
		<h3 class="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
		<div class="max-w-2xl mx-auto space-y-6 text-left">
			<div>
				<h4 class="font-medium mb-2">Is the free version limited?</h4>
				<p class="text-muted-foreground">
					No artificial limits. The free version includes all core functionality - 50+ palettes, 80+ font pairings, live preview, and basic exports. It's genuinely useful for everyone.
				</p>
			</div>
			<div>
				<h4 class="font-medium mb-2">Is this a subscription?</h4>
				<p class="text-muted-foreground">
					No. Premium is a one-time purchase. Pay once, own it forever. No recurring charges, no expiration.
				</p>
			</div>
			<div>
				<h4 class="font-medium mb-2">What if I need a refund?</h4>
				<p class="text-muted-foreground">
					If you're not happy within 30 days, email us and we'll refund you. No questions asked.
				</p>
			</div>
			<div>
				<h4 class="font-medium mb-2">Can I use this commercially?</h4>
				<p class="text-muted-foreground">
					Yes! Both free and premium can be used for personal and commercial projects.
				</p>
			</div>
		</div>
	</div>
</div>
