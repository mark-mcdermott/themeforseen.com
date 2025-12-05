<script lang="ts">
	// Blog/article template
</script>

<div class="template-blog">
	<!-- Nav -->
	<nav class="nav">
		<div class="nav-inner">
			<div class="logo">The Daily Dev</div>
			<div class="nav-links">
				<a href="#home">Home</a>
				<a href="#articles">Articles</a>
				<a href="#about">About</a>
				<a href="#subscribe" class="nav-cta">Subscribe</a>
			</div>
		</div>
	</nav>

	<!-- Article -->
	<article class="article">
		<header class="article-header">
			<div class="article-meta">
				<span class="category">Tutorial</span>
				<span class="date">December 4, 2025</span>
			</div>
			<h1>Building Responsive Layouts with Modern CSS</h1>
			<p class="article-lead">Learn how to create flexible, responsive layouts using CSS Grid and Flexbox without any frameworks.</p>
			<div class="author">
				<div class="author-avatar">JD</div>
				<div class="author-info">
					<span class="author-name">Jane Developer</span>
					<span class="author-role">Senior Engineer at TechCorp</span>
				</div>
			</div>
		</header>

		<div class="article-content">
			<p>Modern CSS has revolutionized how we approach layout design. Gone are the days of float-based layouts and complex clearfix hacks. Today, we have powerful tools like CSS Grid and Flexbox at our disposal.</p>

			<h2>Understanding CSS Grid</h2>
			<p>CSS Grid is a two-dimensional layout system that allows you to create complex layouts with ease. Unlike Flexbox, which is primarily one-dimensional, Grid lets you control both rows and columns simultaneously.</p>

			<div class="code-block">
				<code>.container {'{'}<br/>
				&nbsp;&nbsp;display: grid;<br/>
				&nbsp;&nbsp;grid-template-columns: repeat(3, 1fr);<br/>
				&nbsp;&nbsp;gap: 2rem;<br/>
				{'}'}</code>
			</div>

			<h3>Key Grid Properties</h3>
			<p>Here are the essential properties you need to know:</p>
			<ul>
				<li><strong>grid-template-columns:</strong> Defines the column structure</li>
				<li><strong>grid-template-rows:</strong> Defines the row structure</li>
				<li><strong>gap:</strong> Sets spacing between grid items</li>
				<li><strong>grid-area:</strong> Places items in specific grid areas</li>
			</ul>

			<h2>When to Use Flexbox</h2>
			<p>While Grid excels at two-dimensional layouts, Flexbox is perfect for one-dimensional alignment. Use it for navigation bars, card layouts, and centering content.</p>

			<blockquote>
				"Use Grid for layout, Flexbox for alignment within components."
				<cite>— CSS Working Group</cite>
			</blockquote>

			<h3>Combining Both</h3>
			<p>The real power comes from combining Grid and Flexbox. Use Grid for your overall page layout, then Flexbox for individual component alignment.</p>
		</div>

		<footer class="article-footer">
			<div class="tags">
				<span class="tag">CSS</span>
				<span class="tag">Layout</span>
				<span class="tag">Tutorial</span>
			</div>
			<div class="share">
				<span>Share:</span>
				<button class="share-btn">Twitter</button>
				<button class="share-btn">LinkedIn</button>
			</div>
		</footer>
	</article>

	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-section">
			<h4>Related Articles</h4>
			<ul class="related-list">
				<li><a href="#1">CSS Variables: A Complete Guide</a></li>
				<li><a href="#2">Mastering Flexbox in 10 Minutes</a></li>
				<li><a href="#3">Container Queries Explained</a></li>
			</ul>
		</div>
		<div class="sidebar-section newsletter">
			<h4>Newsletter</h4>
			<p>Get weekly dev tips in your inbox.</p>
			<input type="email" placeholder="your@email.com" class="email-input" />
			<button class="btn-primary">Subscribe</button>
		</div>
	</aside>
</div>

<style>
	.template-blog {
		font-family: var(--font-body, system-ui, sans-serif);
		color: var(--text);
		background: var(--background);
		min-height: 100%;
		display: grid;
		grid-template-columns: 1fr 300px;
		grid-template-rows: auto 1fr;
		gap: 2rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem 3rem;
	}

	/* Nav */
	.nav {
		grid-column: 1 / -1;
		padding: 1rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.nav-inner {
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
	.nav-cta {
		background: var(--primary);
		color: var(--background) !important;
		padding: 0.4rem 1rem;
		border-radius: 6px;
		opacity: 1 !important;
	}

	/* Article */
	.article {
		min-width: 0;
	}
	.article-header {
		margin-bottom: 2rem;
	}
	.article-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}
	.category {
		color: var(--accent);
		font-weight: 500;
	}
	.date {
		opacity: 0.6;
	}
	.article-header h1 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 2.25rem;
		font-weight: 700;
		color: var(--h1-color, var(--primary));
		margin: 0 0 1rem;
		line-height: 1.2;
	}
	.article-lead {
		font-size: 1.2rem;
		opacity: 0.85;
		line-height: 1.6;
		margin: 0 0 1.5rem;
	}
	.author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.author-avatar {
		width: 48px;
		height: 48px;
		background: var(--primary);
		color: var(--background);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}
	.author-info {
		display: flex;
		flex-direction: column;
	}
	.author-name {
		font-weight: 600;
	}
	.author-role {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	/* Article Content */
	.article-content {
		line-height: 1.8;
	}
	.article-content h2 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1.5rem;
		color: var(--h2-color, var(--primary));
		margin: 2rem 0 1rem;
	}
	.article-content h3 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1.2rem;
		color: var(--h3-color, var(--accent));
		margin: 1.5rem 0 0.75rem;
	}
	.article-content p {
		margin: 0 0 1rem;
	}
	.article-content ul {
		margin: 0 0 1rem;
		padding-left: 1.5rem;
	}
	.article-content li {
		margin-bottom: 0.5rem;
	}
	.code-block {
		background: var(--card-background);
		padding: 1rem 1.25rem;
		border-radius: 8px;
		margin: 1.5rem 0;
		overflow-x: auto;
	}
	.code-block code {
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		color: var(--accent);
	}
	blockquote {
		border-left: 4px solid var(--primary);
		margin: 1.5rem 0;
		padding: 1rem 1.5rem;
		background: var(--card-background);
		border-radius: 0 8px 8px 0;
	}
	blockquote cite {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.7;
	}

	/* Article Footer */
	.article-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.tags {
		display: flex;
		gap: 0.5rem;
	}
	.tag {
		background: var(--card-background);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
	}
	.share {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}
	.share-btn {
		background: var(--card-background);
		border: none;
		padding: 0.4rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
		color: var(--text);
	}

	/* Sidebar */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.sidebar-section {
		background: var(--card-background);
		padding: 1.25rem;
		border-radius: 12px;
	}
	.sidebar-section h4 {
		font-family: var(--font-heading, system-ui, sans-serif);
		color: var(--h3-color, var(--accent));
		margin: 0 0 1rem;
		font-size: 1rem;
	}
	.related-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.related-list li {
		padding: 0.5rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 5%, transparent);
	}
	.related-list li:last-child {
		border-bottom: none;
	}
	.related-list a {
		color: var(--text);
		text-decoration: none;
		font-size: 0.9rem;
	}
	.newsletter p {
		font-size: 0.875rem;
		opacity: 0.8;
		margin: 0 0 1rem;
	}
	.email-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		border-radius: 6px;
		margin-bottom: 0.75rem;
		background: var(--background);
		color: var(--text);
	}
	.btn-primary {
		width: 100%;
		background: var(--primary);
		color: var(--background);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}

	@media (max-width: 768px) {
		.template-blog {
			grid-template-columns: 1fr;
		}
		.sidebar {
			order: -1;
		}
	}
</style>
