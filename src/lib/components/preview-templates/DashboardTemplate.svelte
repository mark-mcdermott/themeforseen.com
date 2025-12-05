<script lang="ts">
	// Dashboard template
</script>

<div class="template-dashboard">
	<!-- Sidebar -->
	<aside class="sidebar">
		<div class="sidebar-logo">Dashboard</div>
		<nav class="sidebar-nav">
			<a href="#" class="nav-item active">
				<span class="icon">📊</span> Overview
			</a>
			<a href="#" class="nav-item">
				<span class="icon">📈</span> Analytics
			</a>
			<a href="#" class="nav-item">
				<span class="icon">👥</span> Customers
			</a>
			<a href="#" class="nav-item">
				<span class="icon">📦</span> Products
			</a>
			<a href="#" class="nav-item">
				<span class="icon">💰</span> Revenue
			</a>
			<a href="#" class="nav-item">
				<span class="icon">⚙️</span> Settings
			</a>
		</nav>
	</aside>

	<!-- Main -->
	<main class="main">
		<!-- Header -->
		<header class="header">
			<div>
				<h1>Welcome back, Alex</h1>
				<p>Here's what's happening with your store today.</p>
			</div>
			<div class="header-actions">
				<button class="btn-secondary">Export</button>
				<button class="btn-primary">+ New Report</button>
			</div>
		</header>

		<!-- Stats -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Total Revenue</span>
					<span class="stat-change positive">+12.5%</span>
				</div>
				<div class="stat-value">$45,231.89</div>
				<div class="stat-sub">+$4,325 from last month</div>
			</div>
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Subscriptions</span>
					<span class="stat-change positive">+8.2%</span>
				</div>
				<div class="stat-value">+2,350</div>
				<div class="stat-sub">+180 from last month</div>
			</div>
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Active Users</span>
					<span class="stat-change negative">-2.4%</span>
				</div>
				<div class="stat-value">12,234</div>
				<div class="stat-sub">-312 from last month</div>
			</div>
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Pending Orders</span>
					<span class="stat-change positive">+4.1%</span>
				</div>
				<div class="stat-value">573</div>
				<div class="stat-sub">+23 from yesterday</div>
			</div>
		</div>

		<!-- Content Grid -->
		<div class="content-grid">
			<!-- Chart Card -->
			<div class="card chart-card">
				<div class="card-header">
					<h3>Revenue Overview</h3>
					<select class="select">
						<option>Last 7 days</option>
						<option>Last 30 days</option>
						<option>Last 90 days</option>
					</select>
				</div>
				<div class="chart-placeholder">
					<div class="chart-bar" style="height: 40%;"></div>
					<div class="chart-bar" style="height: 65%;"></div>
					<div class="chart-bar" style="height: 45%;"></div>
					<div class="chart-bar" style="height: 80%;"></div>
					<div class="chart-bar" style="height: 55%;"></div>
					<div class="chart-bar" style="height: 90%;"></div>
					<div class="chart-bar" style="height: 70%;"></div>
				</div>
			</div>

			<!-- Recent Activity -->
			<div class="card">
				<div class="card-header">
					<h3>Recent Activity</h3>
					<a href="#" class="link">View all</a>
				</div>
				<div class="activity-list">
					<div class="activity-item">
						<div class="activity-icon sale">$</div>
						<div class="activity-content">
							<span class="activity-title">New sale completed</span>
							<span class="activity-desc">Order #12345 - $129.00</span>
						</div>
						<span class="activity-time">2m ago</span>
					</div>
					<div class="activity-item">
						<div class="activity-icon user">+</div>
						<div class="activity-content">
							<span class="activity-title">New customer signup</span>
							<span class="activity-desc">jane@example.com</span>
						</div>
						<span class="activity-time">15m ago</span>
					</div>
					<div class="activity-item">
						<div class="activity-icon refund">↩</div>
						<div class="activity-content">
							<span class="activity-title">Refund processed</span>
							<span class="activity-desc">Order #12340 - $49.00</span>
						</div>
						<span class="activity-time">1h ago</span>
					</div>
					<div class="activity-item">
						<div class="activity-icon sale">$</div>
						<div class="activity-content">
							<span class="activity-title">New sale completed</span>
							<span class="activity-desc">Order #12339 - $299.00</span>
						</div>
						<span class="activity-time">2h ago</span>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.template-dashboard {
		font-family: var(--font-body, system-ui, sans-serif);
		color: var(--text);
		background: var(--background);
		min-height: 100%;
		display: grid;
		grid-template-columns: 240px 1fr;
	}

	/* Sidebar */
	.sidebar {
		background: var(--card-background);
		padding: 1.5rem;
		border-right: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.sidebar-logo {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-weight: 700;
		font-size: 1.25rem;
		color: var(--primary);
		margin-bottom: 2rem;
	}
	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		color: var(--text);
		text-decoration: none;
		font-size: 0.9rem;
		transition: background 0.15s;
	}
	.nav-item:hover {
		background: color-mix(in srgb, var(--primary) 10%, transparent);
	}
	.nav-item.active {
		background: var(--primary);
		color: var(--background);
	}
	.icon {
		font-size: 1rem;
	}

	/* Main */
	.main {
		padding: 2rem;
		overflow-y: auto;
	}

	/* Header */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}
	.header h1 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1.75rem;
		color: var(--h1-color, var(--primary));
		margin: 0 0 0.25rem;
	}
	.header p {
		margin: 0;
		opacity: 0.7;
		font-size: 0.95rem;
	}
	.header-actions {
		display: flex;
		gap: 0.75rem;
	}
	.btn-primary {
		background: var(--primary);
		color: var(--background);
		border: none;
		padding: 0.6rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}
	.btn-secondary {
		background: var(--card-background);
		color: var(--text);
		border: 1px solid color-mix(in srgb, var(--text) 20%, transparent);
		padding: 0.6rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}
	.stat-card {
		background: var(--card-background);
		padding: 1.25rem;
		border-radius: 12px;
	}
	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.stat-label {
		font-size: 0.875rem;
		opacity: 0.7;
	}
	.stat-change {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.15rem 0.5rem;
		border-radius: 20px;
	}
	.stat-change.positive {
		background: color-mix(in srgb, #10b981 15%, transparent);
		color: #10b981;
	}
	.stat-change.negative {
		background: color-mix(in srgb, #ef4444 15%, transparent);
		color: #ef4444;
	}
	.stat-value {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--h2-color, var(--primary));
		margin-bottom: 0.25rem;
	}
	.stat-sub {
		font-size: 0.8rem;
		opacity: 0.6;
	}

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 1.25rem;
	}
	.card {
		background: var(--card-background);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.card-header h3 {
		font-family: var(--font-heading, system-ui, sans-serif);
		font-size: 1rem;
		color: var(--h3-color, var(--accent));
		margin: 0;
	}
	.select {
		background: var(--background);
		border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
		border-radius: 6px;
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		color: var(--text);
	}
	.link {
		color: var(--primary);
		text-decoration: none;
		font-size: 0.875rem;
	}

	/* Chart */
	.chart-placeholder {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
		height: 180px;
		padding-top: 1rem;
	}
	.chart-bar {
		flex: 1;
		background: linear-gradient(to top, var(--primary), var(--accent));
		border-radius: 6px 6px 0 0;
		min-height: 20px;
	}

	/* Activity */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.activity-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.activity-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.9rem;
		font-weight: 600;
	}
	.activity-icon.sale {
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		color: var(--primary);
	}
	.activity-icon.user {
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		color: var(--accent);
	}
	.activity-icon.refund {
		background: color-mix(in srgb, #ef4444 15%, transparent);
		color: #ef4444;
	}
	.activity-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.activity-title {
		font-size: 0.9rem;
		font-weight: 500;
	}
	.activity-desc {
		font-size: 0.8rem;
		opacity: 0.6;
	}
	.activity-time {
		font-size: 0.75rem;
		opacity: 0.5;
	}

	@media (max-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.content-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 768px) {
		.template-dashboard {
			grid-template-columns: 1fr;
		}
		.sidebar {
			display: none;
		}
	}
</style>
