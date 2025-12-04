<script lang="ts">
</script>

<svelte:head>
	<title>Getting Started - ThemeForseen</title>
	<meta name="description" content="Learn how to install and use ThemeForseen in your projects" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-16">
	<h1>Getting Started</h1>
	<p class="text-xl text-muted-foreground mt-6 mb-12">
		Get up and running with ThemeForseen in minutes.
	</p>

	<section class="space-y-12">
		<div class="space-y-4">
			<h2>Installation</h2>
			<p class="text-muted-foreground">
				Install ThemeForseen via npm:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>npm install theme-forseen</code></pre>
		</div>

		<div class="space-y-4">
			<h2>Basic Usage</h2>
			<p class="text-muted-foreground">
				ThemeForseen is a web component that auto-initializes upon import. Simply import it at the top level of your application.
			</p>

			<h3 class="text-lg font-semibold mt-6">HTML / Vanilla JS</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;script type="module"&gt;
  import 'theme-forseen';
&lt;/script&gt;</code></pre>

			<h3 class="text-lg font-semibold mt-6">React</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>// In your App.jsx or main entry file
import 'theme-forseen';</code></pre>

			<h3 class="text-lg font-semibold mt-6">SvelteKit</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>// In your +layout.svelte
&lt;script&gt;
  import 'theme-forseen';
&lt;/script&gt;</code></pre>

			<h3 class="text-lg font-semibold mt-6">Next.js</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>// In your _app.js or layout.js
import 'theme-forseen';</code></pre>
		</div>

		<div class="space-y-4">
			<h2>Features</h2>
			<ul class="list-disc list-inside space-y-2 text-muted-foreground">
				<li><strong>Live Color Theme Preview</strong> - Browse curated color palettes with instant feedback</li>
				<li><strong>Font Pairing Preview</strong> - Explore thoughtful font combinations</li>
				<li><strong>Light &amp; Dark Mode</strong> - Supports both modes simultaneously</li>
				<li><strong>Keyboard Navigation</strong> - Use arrow keys or mouse wheel to scroll through themes</li>
				<li><strong>Framework Agnostic</strong> - Works with any framework as a web component</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2>Tailwind CSS Integration</h2>
			<p class="text-muted-foreground">
				ThemeForseen works seamlessly with Tailwind CSS by exposing CSS custom properties that you can reference in your Tailwind config.
			</p>

			<h3 class="text-lg font-semibold mt-6">Tailwind v4 (CSS Config)</h3>
			<p class="text-muted-foreground">
				Reference the CSS variables within the <code class="bg-muted px-1.5 py-0.5 rounded">@theme inline</code> block in your stylesheet:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>@theme inline {'{'}
  --color-primary: var(--primary-color);
  --color-secondary: var(--secondary-color);
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
{'}'}</code></pre>

			<h3 class="text-lg font-semibold mt-6">Tailwind v3 (JS Config)</h3>
			<p class="text-muted-foreground">
				Extend your theme in <code class="bg-muted px-1.5 py-0.5 rounded">tailwind.config.js</code>:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>module.exports = {'{'}
  theme: {'{'}
    extend: {'{'}
      colors: {'{'}
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
      {'}'},
      fontFamily: {'{'}
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      {'}'},
    {'}'},
  {'}'},
{'}'}</code></pre>

			<h3 class="text-lg font-semibold mt-6">Using in Your Components</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;h1 class="font-heading text-primary"&gt;Hello World&lt;/h1&gt;
&lt;p class="font-body text-secondary"&gt;Welcome to my site&lt;/p&gt;</code></pre>
		</div>

		<div class="space-y-4">
			<h2>Available CSS Variables</h2>
			<p class="text-muted-foreground">
				ThemeForseen exposes the following CSS custom properties:
			</p>

			<h3 class="text-lg font-semibold mt-6">Colors</h3>
			<ul class="list-disc list-inside space-y-1 text-muted-foreground font-mono text-sm">
				<li>--primary-color</li>
				<li>--secondary-color</li>
				<li>--background-color</li>
				<li>--card-background-color</li>
				<li>--text-color</li>
				<li>--heading-color</li>
			</ul>

			<h3 class="text-lg font-semibold mt-6">Fonts</h3>
			<ul class="list-disc list-inside space-y-1 text-muted-foreground font-mono text-sm">
				<li>--font-heading</li>
				<li>--font-body</li>
			</ul>
		</div>

		<div class="space-y-4">
			<h2>Customization</h2>
			<p class="text-muted-foreground">
				Want to add your own color palettes or font pairings? You can customize ThemeForseen by modifying the source:
			</p>
			<ol class="list-decimal list-inside space-y-2 text-muted-foreground">
				<li>Clone the <a href="https://github.com/mark-mcdermott/theme-forseen" class="underline hover:text-foreground">repository</a></li>
				<li>Modify <code class="bg-muted px-1.5 py-0.5 rounded">src/themes.ts</code> to add your custom palettes</li>
				<li>Run <code class="bg-muted px-1.5 py-0.5 rounded">npm run build</code> to compile</li>
			</ol>
		</div>

		<div class="space-y-4">
			<h2>Development</h2>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code># Build the project
npm run build

# Watch mode for development
npm run dev</code></pre>
		</div>

		<div class="space-y-4">
			<h2>Source Code</h2>
			<p class="text-muted-foreground">
				ThemeForseen is open source. View the code, report issues, or contribute on <a href="https://github.com/mark-mcdermott/theme-forseen" class="underline hover:text-foreground">GitHub</a>.
			</p>
		</div>
	</section>
</div>
