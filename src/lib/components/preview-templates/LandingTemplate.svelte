<script lang="ts">
	// Landing page template - SaaS style
</script>

<div class="template-landing">
	<!-- Nav -->
	<nav class="nav">
		<div class="nav-inner">
			<div class="logo">Acme Inc</div>
			<div class="nav-links">
				<a href="#features">Features</a>
				<a href="#pricing">Pricing</a>
				<a href="#about">About</a>
				<button class="btn-primary">Get Started</button>
			</div>
		</div>
	</nav>

	<!-- Hero -->
	<section class="hero">
		<h1>Build faster with our platform</h1>
		<p class="hero-sub">The modern toolkit for developers who want to ship quickly without sacrificing quality.</p>
		<div class="hero-buttons">
			<button class="btn-primary btn-lg">Start Free Trial</button>
			<button class="btn-secondary btn-lg">View Demo</button>
		</div>
	</section>

	<!-- Features -->
	<section class="features">
		<h2>Everything you need</h2>
		<div class="feature-grid">
			<div class="feature-card">
				<div class="feature-icon">⚡</div>
				<h3>Lightning Fast</h3>
				<p>Optimized performance out of the box. No configuration needed.</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🔒</div>
				<h3>Secure by Default</h3>
				<p>Enterprise-grade security with automatic updates and patches.</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">🎨</div>
				<h3>Fully Customizable</h3>
				<p>Tailor every aspect to match your brand perfectly.</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="cta">
		<h2>Ready to get started?</h2>
		<p>Join thousands of developers building with Acme.</p>
		<button class="btn-accent btn-lg">Start Building Today</button>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-inner">
			<div class="footer-brand">Acme Inc</div>
			<div class="footer-links">
				<a href="#privacy">Privacy</a>
				<a href="#terms">Terms</a>
				<a href="#contact">Contact</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.template-landing {
		font-family: var(--font-body, system-ui, sans-serif);
		color: var(--text);
		background: var(--background);
		min-height: 100%;
	}

	/* Nav */
	.nav {
		background: var(--card-background);
		border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		padding: 1rem 0;
	}
	.nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.logo {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-weight: 700;
		font-size: 1.25rem;
		color: var(--primary);
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	.nav-links a {
		color: var(--text);
		text-decoration: none;
		font-size: 0.9rem;
		opacity: 0.8;
	}

	/* Buttons */
	.btn-primary {
		background: var(--primary);
		color: var(--background);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}
	.btn-secondary {
		background: transparent;
		color: var(--primary);
		border: 2px solid var(--primary);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}
	.btn-accent {
		background: var(--accent);
		color: var(--background);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}
	.btn-lg {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
	}

	/* Hero */
	.hero {
		text-align: center;
		padding: 5rem 1.5rem;
		max-width: 800px;
		margin: 0 auto;
	}
	.hero h1 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 3rem;
		font-weight: 700;
		color: var(--h1-color, var(--primary));
		margin: 0 0 1rem;
		line-height: 1.1;
	}
	.hero-sub {
		font-size: 1.25rem;
		opacity: 0.8;
		margin: 0 0 2rem;
		line-height: 1.6;
	}
	.hero-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Features */
	.features {
		background: var(--card-background);
		padding: 4rem 1.5rem;
	}
	.features h2 {
		font-family: var(--font-heading, system-ui, sans-serif);
		text-align: center;
		font-size: 2rem;
		color: var(--h2-color, var(--primary));
		margin: 0 0 3rem;
	}
	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		max-width: 1100px;
		margin: 0 auto;
	}
	.feature-card {
		background: var(--background);
		padding: 2rem;
		border-radius: 12px;
		text-align: center;
	}
	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}
	.feature-card h3 {
		font-family: var(--font-heading, system-ui, sans-serif);
		color: var(--h3-color, var(--accent));
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
	}
	.feature-card p {
		margin: 0;
		opacity: 0.8;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	/* CTA */
	.cta {
		text-align: center;
		padding: 5rem 1.5rem;
	}
	.cta h2 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 2rem;
		color: var(--h2-color, var(--primary));
		margin: 0 0 0.5rem;
	}
	.cta p {
		opacity: 0.8;
		margin: 0 0 2rem;
	}

	/* Footer */
	.footer {
		background: var(--card-background);
		padding: 2rem 0;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.footer-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.footer-brand {
		font-weight: 600;
		color: var(--primary);
	}
	.footer-links {
		display: flex;
		gap: 1.5rem;
	}
	.footer-links a {
		color: var(--text);
		text-decoration: none;
		font-size: 0.875rem;
		opacity: 0.7;
	}
</style>
