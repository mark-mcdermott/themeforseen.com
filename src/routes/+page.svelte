<svelte:head>
	<title>themeforseen.com</title>
	<meta name="description" content="themeforseen.com - Home" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 pb-16">
	<!-- Hero Section -->
	<div class="py-12 sm:py-16 text-center">
		<h1 class="text-4xl sm:text-5xl font-semibold tracking-tight flex items-center justify-center gap-3">
			<span class="text-5xl sm:text-6xl">🎉</span>
			themeforseen.com
		</h1>
		<p class="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
			A multi-page server-side rendered site with responsive navigation and smooth page transitions. Unlike static sites, pages are rendered on each request—ideal for authenticated content, user dashboards, or dynamic data.
		</p>
	</div>

	<!-- Modules Added -->
	<div class="py-8 text-center">
		<h2 class="text-xl font-semibold mb-6">Modules Added</h2>
		<div class="space-y-4">
			<div class="flex gap-4 items-center justify-center">
				<div class="text-2xl">🔐</div>
				<h3 class="font-medium">Authentication</h3>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="py-8">
		<h2 class="text-2xl font-semibold tracking-tight text-center mb-8">Why SSR?</h2>
		<div class="grid sm:grid-cols-3 gap-6">
			<div class="text-center">
				<div class="text-3xl mb-3">🔐</div>
				<h3 class="font-medium mb-1">Auth Ready</h3>
				<p class="text-sm text-muted-foreground">Server-side rendering enables secure session handling, making it the perfect base for authentication.</p>
			</div>
			<div class="text-center">
				<div class="text-3xl mb-3">⚡</div>
				<h3 class="font-medium mb-1">Dynamic Content</h3>
				<p class="text-sm text-muted-foreground">Fetch fresh data on every request. Perfect for dashboards, user profiles, and real-time content.</p>
			</div>
			<div class="text-center">
				<div class="text-3xl mb-3">🛡️</div>
				<h3 class="font-medium mb-1">Secure by Default</h3>
				<p class="text-sm text-muted-foreground">Server-side code stays on the server. API keys and sensitive logic never reach the client.</p>
			</div>
		</div>
	</div>

	<!-- CTA Section -->
	<div class="py-8 mt-4">
		<div class="card text-center py-8">
			<h2 class="text-2xl font-semibold tracking-tight mb-2 mt-0">Ready to Build?</h2>
			<p class="text-muted-foreground mb-6">This template is designed to be extended with authentication, database connections, and protected routes.</p>
			<a href="/services" class="btn btn-dark">View Our Services</a>
		</div>
	</div>
</div>
