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
				The drawer auto-initializes when you import the module—no setup code needed.
			</p>

			<h3 class="text-lg font-semibold mt-6">With a Bundler (Vite, Webpack, Parcel, etc.)</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;script type="module"&gt;
  import 'theme-forseen';
&lt;/script&gt;</code></pre>

			<h3 class="text-lg font-semibold mt-6">Without a Bundler (plain HTML)</h3>
			<p class="text-muted-foreground">
				If you're serving static HTML files without a bundler, use the full path:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;script type="module"&gt;
  import '/node_modules/theme-forseen/dist/index.js';
&lt;/script&gt;</code></pre>
			<p class="text-muted-foreground mt-4">
				Or use a CDN:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;script type="module"&gt;
  import 'https://unpkg.com/theme-forseen/dist/index.js';
&lt;/script&gt;</code></pre>

			<h3 class="text-lg font-semibold mt-6">SvelteKit</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;script&gt;
  import 'theme-forseen';
&lt;/script&gt;</code></pre>

			<h3 class="text-lg font-semibold mt-6">React</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>import 'theme-forseen';

function App() {'{'}
  return &lt;div&gt;Your app&lt;/div&gt;;
{'}'}</code></pre>
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
				ThemeForseen sets CSS variables on <code class="bg-muted px-1.5 py-0.5 rounded">&lt;html&gt;</code> at runtime when you select themes. You just need to tell Tailwind about them.
			</p>

			<h3 class="text-lg font-semibold mt-6">Tailwind v4 (CSS-first config)</h3>
			<p class="text-muted-foreground">
				Add this to your main CSS file:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>@import "tailwindcss";

@theme inline {'{'}
  --color-primary: var(--color-primary);
  --color-primary-shadow: var(--color-primary-shadow);
  --color-accent: var(--color-accent);
  --color-accent-shadow: var(--color-accent-shadow);
  --color-bg: var(--color-bg);
  --color-card-bg: var(--color-card-bg);
  --color-text: var(--color-text);
  --color-extra: var(--color-extra);
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
{'}'}</code></pre>
			<p class="text-muted-foreground mt-2">
				The <code class="bg-muted px-1.5 py-0.5 rounded">inline</code> keyword tells Tailwind these reference external runtime variables.
			</p>

			<h3 class="text-lg font-semibold mt-6">Tailwind v3 (JS config)</h3>
			<p class="text-muted-foreground">
				Update your <code class="bg-muted px-1.5 py-0.5 rounded">tailwind.config.js</code>:
			</p>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>export default {'{'}
  theme: {'{'}
    extend: {'{'}
      colors: {'{'}
        primary: 'var(--color-primary)',
        'primary-shadow': 'var(--color-primary-shadow)',
        accent: 'var(--color-accent)',
        'accent-shadow': 'var(--color-accent-shadow)',
        bg: 'var(--color-bg)',
        'card-bg': 'var(--color-card-bg)',
        text: 'var(--color-text)',
        extra: 'var(--color-extra)',
      {'}'},
    {'}'},
    fontFamily: {'{'}
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
    {'}'},
  {'}'},
{'}'}</code></pre>

			<h3 class="text-lg font-semibold mt-6">Using the classes</h3>
			<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code>&lt;h1 class="font-heading text-primary"&gt;Hello World&lt;/h1&gt;
&lt;p class="font-body text-text bg-bg"&gt;Body text&lt;/p&gt;</code></pre>
		</div>

		<div class="space-y-4">
			<h2>CSS Variables Reference</h2>

			<h3 class="text-lg font-semibold mt-6">Colors</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b">
							<th class="text-left py-2 pr-4 font-mono">Variable</th>
							<th class="text-left py-2">Description</th>
						</tr>
					</thead>
					<tbody class="text-muted-foreground">
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-primary</td><td>Primary brand color</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-primary-shadow</td><td>Darker shade of primary</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-accent</td><td>Accent/secondary color</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-accent-shadow</td><td>Darker shade of accent</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-bg</td><td>Background color</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-card-bg</td><td>Card/surface background</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-text</td><td>Main text color</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-extra</td><td>Additional accent color</td></tr>
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--color-h1, --color-h2, --color-h3</td><td>Heading colors</td></tr>
						<tr><td class="py-2 pr-4 font-mono">--color-heading</td><td>General heading color (same as h1)</td></tr>
					</tbody>
				</table>
			</div>

			<h3 class="text-lg font-semibold mt-6">Fonts</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b">
							<th class="text-left py-2 pr-4 font-mono">Variable</th>
							<th class="text-left py-2">Description</th>
						</tr>
					</thead>
					<tbody class="text-muted-foreground">
						<tr class="border-b"><td class="py-2 pr-4 font-mono">--font-heading</td><td>Font family for headings</td></tr>
						<tr><td class="py-2 pr-4 font-mono">--font-body</td><td>Font family for body text</td></tr>
					</tbody>
				</table>
			</div>
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
