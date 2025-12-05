<script lang="ts">
	// E-commerce product grid template
</script>

<div class="template-ecommerce">
	<!-- Nav -->
	<nav class="nav">
		<div class="nav-inner">
			<div class="logo">ShopStyle</div>
			<div class="nav-links">
				<a href="#new">New Arrivals</a>
				<a href="#women">Women</a>
				<a href="#men">Men</a>
				<a href="#sale">Sale</a>
			</div>
			<div class="nav-actions">
				<button class="icon-btn">🔍</button>
				<button class="icon-btn">👤</button>
				<button class="icon-btn cart-btn">🛒 <span class="cart-count">3</span></button>
			</div>
		</div>
	</nav>

	<!-- Hero Banner -->
	<section class="hero-banner">
		<div class="hero-content">
			<span class="hero-tag">New Collection</span>
			<h1>Winter Essentials</h1>
			<p>Discover cozy styles for the cold season</p>
			<button class="btn-primary btn-lg">Shop Now</button>
		</div>
	</section>

	<!-- Products -->
	<section class="products-section">
		<div class="section-header">
			<h2>Trending Now</h2>
			<div class="filter-bar">
				<select class="filter-select">
					<option>All Categories</option>
					<option>Clothing</option>
					<option>Accessories</option>
					<option>Shoes</option>
				</select>
				<select class="filter-select">
					<option>Sort by: Featured</option>
					<option>Price: Low to High</option>
					<option>Price: High to Low</option>
					<option>Newest</option>
				</select>
			</div>
		</div>

		<div class="products-grid">
			<div class="product-card">
				<div class="product-image">
					<span class="product-badge">New</span>
					<div class="product-placeholder">👕</div>
					<button class="wishlist-btn">♡</button>
				</div>
				<div class="product-info">
					<h3>Classic Oxford Shirt</h3>
					<p class="product-category">Men's Clothing</p>
					<div class="product-price">
						<span class="price">$79.00</span>
					</div>
				</div>
			</div>

			<div class="product-card">
				<div class="product-image">
					<span class="product-badge sale">-30%</span>
					<div class="product-placeholder">👗</div>
					<button class="wishlist-btn">♡</button>
				</div>
				<div class="product-info">
					<h3>Silk Midi Dress</h3>
					<p class="product-category">Women's Clothing</p>
					<div class="product-price">
						<span class="price-old">$149.00</span>
						<span class="price sale">$104.30</span>
					</div>
				</div>
			</div>

			<div class="product-card">
				<div class="product-image">
					<div class="product-placeholder">👟</div>
					<button class="wishlist-btn filled">♥</button>
				</div>
				<div class="product-info">
					<h3>Running Sneakers</h3>
					<p class="product-category">Footwear</p>
					<div class="product-price">
						<span class="price">$129.00</span>
					</div>
				</div>
			</div>

			<div class="product-card">
				<div class="product-image">
					<div class="product-placeholder">👜</div>
					<button class="wishlist-btn">♡</button>
				</div>
				<div class="product-info">
					<h3>Leather Tote Bag</h3>
					<p class="product-category">Accessories</p>
					<div class="product-price">
						<span class="price">$195.00</span>
					</div>
				</div>
			</div>

			<div class="product-card">
				<div class="product-image">
					<span class="product-badge">New</span>
					<div class="product-placeholder">🧥</div>
					<button class="wishlist-btn">♡</button>
				</div>
				<div class="product-info">
					<h3>Wool Blend Coat</h3>
					<p class="product-category">Outerwear</p>
					<div class="product-price">
						<span class="price">$299.00</span>
					</div>
				</div>
			</div>

			<div class="product-card">
				<div class="product-image">
					<div class="product-placeholder">⌚</div>
					<button class="wishlist-btn">♡</button>
				</div>
				<div class="product-info">
					<h3>Minimalist Watch</h3>
					<p class="product-category">Accessories</p>
					<div class="product-price">
						<span class="price">$175.00</span>
					</div>
				</div>
			</div>
		</div>

		<div class="load-more">
			<button class="btn-secondary">Load More Products</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-grid">
			<div class="footer-col">
				<h4>Shop</h4>
				<a href="#">New Arrivals</a>
				<a href="#">Best Sellers</a>
				<a href="#">Sale</a>
				<a href="#">Gift Cards</a>
			</div>
			<div class="footer-col">
				<h4>Help</h4>
				<a href="#">FAQ</a>
				<a href="#">Shipping</a>
				<a href="#">Returns</a>
				<a href="#">Contact</a>
			</div>
			<div class="footer-col">
				<h4>About</h4>
				<a href="#">Our Story</a>
				<a href="#">Sustainability</a>
				<a href="#">Careers</a>
				<a href="#">Press</a>
			</div>
			<div class="footer-col newsletter">
				<h4>Stay in Touch</h4>
				<p>Get 10% off your first order</p>
				<div class="newsletter-form">
					<input type="email" placeholder="Email address" />
					<button class="btn-primary">→</button>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<span>© 2025 ShopStyle. All rights reserved.</span>
		</div>
	</footer>
</div>

<style>
	.template-ecommerce {
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
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.logo {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--primary);
	}
	.nav-links {
		display: flex;
		gap: 2rem;
	}
	.nav-links a {
		color: var(--text);
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
	}
	.nav-actions {
		display: flex;
		gap: 0.5rem;
	}
	.icon-btn {
		background: transparent;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		padding: 0.5rem;
		position: relative;
	}
	.cart-count {
		position: absolute;
		top: 0;
		right: 0;
		background: var(--accent);
		color: var(--background);
		font-size: 0.65rem;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Hero Banner */
	.hero-banner {
		background: linear-gradient(135deg, var(--primary), var(--accent));
		padding: 4rem 1.5rem;
		text-align: center;
	}
	.hero-content {
		max-width: 600px;
		margin: 0 auto;
	}
	.hero-tag {
		display: inline-block;
		background: rgba(255,255,255,0.2);
		color: var(--background);
		padding: 0.3rem 1rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		margin-bottom: 1rem;
	}
	.hero-banner h1 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 2.5rem;
		color: var(--background);
		margin: 0 0 0.5rem;
	}
	.hero-banner p {
		color: var(--background);
		opacity: 0.9;
		margin: 0 0 1.5rem;
		font-size: 1.1rem;
	}
	.btn-primary {
		background: var(--background);
		color: var(--primary);
		border: none;
		padding: 0.6rem 1.25rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}
	.btn-lg {
		padding: 0.8rem 2rem;
		font-size: 1rem;
	}
	.btn-secondary {
		background: transparent;
		color: var(--primary);
		border: 2px solid var(--primary);
		padding: 0.6rem 1.25rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}

	/* Products Section */
	.products-section {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
	}
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.section-header h2 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1.75rem;
		color: var(--h2-color, var(--primary));
		margin: 0;
	}
	.filter-bar {
		display: flex;
		gap: 1rem;
	}
	.filter-select {
		background: var(--card-background);
		border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: var(--text);
	}

	/* Products Grid */
	.products-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
	}
	.product-card {
		background: var(--card-background);
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px color-mix(in srgb, var(--text) 10%, transparent);
	}
	.product-image {
		position: relative;
		aspect-ratio: 1;
		background: var(--background);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.product-placeholder {
		font-size: 4rem;
		opacity: 0.8;
	}
	.product-badge {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		background: var(--primary);
		color: var(--background);
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
	}
	.product-badge.sale {
		background: var(--accent);
	}
	.wishlist-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: var(--background);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}
	.wishlist-btn.filled {
		color: var(--accent);
	}
	.product-info {
		padding: 1rem;
	}
	.product-info h3 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1rem;
		color: var(--h3-color, var(--text));
		margin: 0 0 0.25rem;
	}
	.product-category {
		font-size: 0.8rem;
		opacity: 0.6;
		margin: 0 0 0.5rem;
	}
	.product-price {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.price {
		font-weight: 600;
		color: var(--primary);
	}
	.price.sale {
		color: var(--accent);
	}
	.price-old {
		text-decoration: line-through;
		opacity: 0.5;
		font-size: 0.9rem;
	}

	/* Load More */
	.load-more {
		text-align: center;
		margin-top: 2.5rem;
	}

	/* Footer */
	.footer {
		background: var(--card-background);
		padding: 3rem 1.5rem 1.5rem;
		margin-top: 3rem;
	}
	.footer-grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2rem;
	}
	.footer-col h4 {
		font-family: var(--font-heading, system-ui, sans-serif);
		color: var(--h3-color, var(--accent));
		margin: 0 0 1rem;
		font-size: 0.95rem;
	}
	.footer-col a {
		display: block;
		color: var(--text);
		text-decoration: none;
		font-size: 0.875rem;
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}
	.footer-col.newsletter p {
		font-size: 0.875rem;
		opacity: 0.7;
		margin: 0 0 1rem;
	}
	.newsletter-form {
		display: flex;
		gap: 0.5rem;
	}
	.newsletter-form input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font-size: 0.875rem;
	}
	.footer-bottom {
		max-width: 1200px;
		margin: 2rem auto 0;
		padding-top: 1.5rem;
		border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
		font-size: 0.8rem;
		opacity: 0.6;
	}

	@media (max-width: 900px) {
		.products-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 600px) {
		.nav-links {
			display: none;
		}
		.products-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
