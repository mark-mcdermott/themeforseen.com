<script lang="ts">
	import { AccountPage } from '$lib/components/blocks';
	import { Card, Button } from '$lib/components/ui';
	import { Sparkles, Copy, Check, Zap } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let { data, form } = $props();
	let copied = $state(false);

	onMount(() => {
		if (data.justUpgraded) {
			toast.success('Payment successful! Welcome to Premium!');
			// Clean up URL
			window.history.replaceState({}, '', '/account');
		}
	});

	function copyLicenseKey() {
		if (data.license?.licenseKey) {
			navigator.clipboard.writeText(data.license.licenseKey);
			copied = true;
			toast.success('License key copied to clipboard');
			setTimeout(() => (copied = false), 2000);
		}
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Account Settings</title>
	<meta name="description" content="Manage your account settings" />
</svelte:head>

<AccountPage user={data.user} {form} />

<!-- License Section -->
<div class="max-w-4xl mx-auto px-6 pb-12 -mt-6">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Sparkles class="w-5 h-5" />
				License
			</Card.Title>
			<Card.Description>Your ThemeForseen license status</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.user?.isPremium && data.license}
				<div class="space-y-4">
					<div class="flex items-center gap-2">
						<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600">
							<Check class="w-4 h-4 mr-1" />
							Premium Active
						</span>
					</div>

					<div class="space-y-2">
						<p class="text-sm font-medium">License Key</p>
						<div class="flex items-center gap-2">
							<code class="flex-1 px-3 py-2 bg-muted rounded font-mono text-sm">
								{data.license.licenseKey}
							</code>
							<button
								onclick={copyLicenseKey}
								class="p-2 hover:bg-muted rounded transition-colors"
								title="Copy license key"
							>
								{#if copied}
									<Check class="w-4 h-4 text-green-500" />
								{:else}
									<Copy class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<p class="text-sm text-muted-foreground">
						Purchased on {formatDate(data.license.purchasedAt)}
					</p>
				</div>
			{:else}
				<div class="space-y-4">
					<p class="text-muted-foreground">
						You're currently on the free plan. Upgrade to Premium for advanced features.
					</p>
					<a href="/pricing">
						<Button.Root class="gap-2">
							<Zap class="w-4 h-4" />
							Upgrade to Premium
						</Button.Root>
					</a>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
