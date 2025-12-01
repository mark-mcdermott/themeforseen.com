<script lang="ts">
	let email = $state('');
</script>

<div class="max-w-2xl mx-auto px-6 py-16 text-center">
	<h1>Subscribe</h1>
	<p class="text-xl text-muted-foreground mt-6 mb-12">
		Stay updated with the latest features, releases, and tips.
	</p>

	<form class="space-y-4" onsubmit={(e) => e.preventDefault()}>
		<div>
			<input
				type="email"
				bind:value={email}
				placeholder="Enter your email"
				class="form-input w-full max-w-md"
				required
			/>
		</div>
		<button type="submit" class="btn btn-dark">
			Subscribe
		</button>
	</form>

	<div class="mt-16 text-left max-w-md mx-auto">
		<h2 class="text-center">What you'll get</h2>
		<ul class="space-y-4 text-muted-foreground">
			<li class="flex gap-3">
				<span class="text-foreground">&#10003;</span>
				<span>Early access to new features and releases</span>
			</li>
			<li class="flex gap-3">
				<span class="text-foreground">&#10003;</span>
				<span>Tips and tutorials for better theming</span>
			</li>
			<li class="flex gap-3">
				<span class="text-foreground">&#10003;</span>
				<span>Community highlights and showcases</span>
			</li>
			<li class="flex gap-3">
				<span class="text-foreground">&#10003;</span>
				<span>No spam, unsubscribe anytime</span>
			</li>
		</ul>
	</div>
</div>
