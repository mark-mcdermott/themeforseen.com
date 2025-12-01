<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Button, Sheet, DropdownMenu, ThemeToggle } from '$lib/components/ui';
	import type { ToggleMode } from '$lib/components/ui/theme-toggle/ThemeToggle.svelte';
	import { Menu, ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import type { NavLink, DropdownLink, AvatarConfig } from './types';

	interface Props {
		siteName?: string;
		logo?: string;
		logoIcon?: Snippet;
		user?: { id: string; email: string; name?: string | null; avatarUrl?: string | null } | null;
		isAdmin?: boolean;
		links?: NavLink[];
		avatar?: AvatarConfig;
		// Optional max-width for the nav content (e.g., 'max-w-6xl', 'max-w-4xl')
		maxWidth?: string;
		// Theme toggle settings
		showThemeToggle?: boolean;
		themeToggleMode?: ToggleMode;
	}

	let {
		siteName,
		logo,
		logoIcon,
		user = null,
		isAdmin = false,
		links = [],
		avatar,
		maxWidth,
		showThemeToggle = false,
		themeToggleMode = 'light-dark-system'
	}: Props = $props();

	// Detect if logo is an image path or text/emoji
	const isLogoImage = $derived(
		logo?.startsWith('/') ||
			logo?.startsWith('http') ||
			logo?.endsWith('.png') ||
			logo?.endsWith('.jpg') ||
			logo?.endsWith('.svg')
	);

	let mobileMenuOpen = $state(false);
	let expandedDropdowns = $state<Record<string, boolean>>({});

	const isLoggedIn = $derived(!!user);
	const userEmail = $derived(user?.email || '');
	const avatarLetter = $derived(userEmail ? userEmail.charAt(0).toUpperCase() : 'U');
	const userAvatarUrl = $derived(user?.avatarUrl);

	// Compute avatar config
	const showAvatar = $derived(avatar?.show !== false && isLoggedIn);
	const avatarLinks = $derived<DropdownLink[]>(avatar?.links ?? []);

	// Filter links based on auth state
	function shouldShowLink(link: NavLink): boolean {
		if (link.requiresAuth && !isLoggedIn) return false;
		if (link.requiresAdmin && !isAdmin) return false;
		if (link.hideWhenAuth && isLoggedIn) return false;
		return true;
	}

	const visibleLinks = $derived(links.filter(shouldShowLink));

	function toggleDropdown(key: string) {
		expandedDropdowns[key] = !expandedDropdowns[key];
	}

	// Get a unique key for dropdown state (label, testId, or href)
	function getDropdownKey(link: NavLink): string {
		return link.label ?? link.testId ?? link.href ?? 'dropdown';
	}

	function buildDataAttrs(data?: Record<string, string>): Record<string, string> {
		if (!data) return {};
		const result: Record<string, string> = {};
		for (const [key, value] of Object.entries(data)) {
			result[`data-${key}`] = value;
		}
		return result;
	}

	// Check if a link is active (matches current path)
	function isActive(href: string | undefined): boolean {
		if (!href) return false;
		const currentPath = $page.url.pathname;
		// For jump links (starting with #), never mark as active
		if (href.startsWith('#')) return false;
		// Exact match
		return currentPath === href;
	}

	// Get icon size class based on iconSize prop
	function getIconSizeClass(size?: 'sm' | 'md' | 'lg'): string {
		switch (size) {
			case 'sm':
				return 'h-4 w-4';
			case 'lg':
				return 'h-6 w-6';
			case 'md':
			default:
				return 'h-5 w-5';
		}
	}
</script>

<nav data-testid="nav" class="relative z-10 w-full {maxWidth ? '' : 'flex items-center justify-between px-8'} py-6">
	<div class="{maxWidth ? `${maxWidth} mx-auto px-6 flex items-center justify-between` : 'contents'}">

	<!-- Logo -->
	<a
		href="/"
		data-testid="nav-logo"
		class="flex items-center gap-2 no-underline hover:no-underline cursor-pointer"
	>
		{#if logoIcon}
			<span class="text-2xl text-foreground">
				{@render logoIcon()}
			</span>
		{:else if logo}
			{#if isLogoImage}
				<img src={logo} alt={siteName ?? ''} class="w-8 h-8 object-contain" />
			{:else}
				<span class="text-2xl">{logo}</span>
			{/if}
		{:else}
			<!-- Default ThemeForseen logo -->
			<svg
				id="Layer_1"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 97.6 56.38"
				width="60"
				height="35"
			>
				<line style="fill: none; stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.8px;" x1="87.35" y1="8.38" x2="75.71" y2="8.38" />
				<path
					style="fill: #010101;"
					d="M7.49,6.7c0,2.07-1.68,3.75-3.75,3.75s-3.75-1.68-3.75-3.75,1.68-3.75-3.75-3.75,3.75,1.68,3.75,3.75Z"
				/>
				<path
					style="fill: var(--primary-color, #51c5f4); stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.8px;"
					d="M35.28,10.45c0,2.07-1.68,3.75-3.75,3.75s-3.75-1.68-3.75-3.75,1.68-3.75,3.75-3.75,3.75,1.68,3.75,3.75Z"
				/>
				<polyline
					style="fill: var(--secondary-color, #eae84a); stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.1px;"
					points="45.97 18.89 56.24 1.55 66.27 19.35"
				/>
				<path
					style="fill: #fff; stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.1px;"
					d="M87.35,33.43c-21.38-21.36-42.75-21.1-64.13,0"
				/>
				<path
					style="fill: #fff; stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.1px;"
					d="M23.22,33.43c12.92,16.52,43.02,22.82,64.13,0"
				/>
				<path
					style="fill: var(--primary-color, #51c5f4); stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.1px;"
					d="M66.24,29.75c0,6.08-4.93,11.01-11.01,11.01s-11.01-4.93-11.01-11.01,4.93-11.01,11.01-11.01,11.01,4.93,11.01,11.01Z"
				/>
				<path
					style="fill: var(--secondary-color, #eae84a); stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3.1px;"
					d="M78.49,41.04c1.26-.65,3.24,5.28,7.77,13.79H24.67l7.77-13.12c5.5,3.54,13.53,6.55,22.9,6.58s17.83-4.51,23.15-7.25Z"
				/>
				<path
					style="fill: #010101;"
					d="M61.54,29.75c0,3.49-2.83,6.31-6.31,6.31s-6.31-2.83-6.31-6.31,2.83-6.31,6.31-6.31,6.31,2.83,6.31,6.31Z"
				/>
				<path
					style="fill: #010101;"
					d="M19.51,45.15s.08-.04.12-.05c.78-.34,1.29-1.16,1.19-2.05-.1-.9-.79-1.58-1.63-1.73-.03,0-.06-.02-.09-.02-.32-.05-1.91-.38-2.25-2.33,0-.02,0-.03-.01-.04-.02-.08-.04-.15-.06-.22-.02-.05-.03-.11-.05-.16-.03-.06-.06-.12-.09-.18-.03-.05-.06-.11-.09-.16-.04-.05-.08-.1-.12-.15-.04-.05-.08-.1-.12-.14-.05-.05-.1-.09-.15-.13-.05-.04-.09-.08-.14-.11-.05-.04-.12-.07-.17-.1-.06-.03-.11-.06-.17-.09-.05-.02-.11-.04-.17-.06-.07-.02-.14-.04-.21-.06-.02,0-.03,0-.05-.01-.04,0-.09,0-.13,0-.07,0-.14-.02-.21-.02-.07,0-.14,0-.21.01-.05,0-.09,0-.14.01-.02,0-.03.01-.05.01-.07.01-.13.04-.2.06-.06.02-.13.04-.19.06-.05.02-.1.05-.15.08-.07.03-.13.07-.19.11-.04.03-.08.06-.12.1-.06.05-.12.09-.17.15-.04.04-.07.09-.11.13-.04.05-.09.11-.13.16-.03.05-.06.1-.09.16-.03.06-.07.12-.1.19-.02.05-.04.11-.05.16-.02.07-.05.14-.06.22,0,.01,0,.03-.01.04-.34,1.94-1.92,2.28-2.25,2.33-.04,0-.08.02-.12.03-.08.01-.15.03-.23.05-.06.02-.12.05-.18.07-.05.02-.11.04-.16.07-.08.04-.15.09-.22.15-.02.02-.05.03-.07.05-.52.42-.83,1.08-.75,1.79.11.92.81,1.61,1.68,1.74.02,0,.03,0,.04.01.32.05,1.91.38,2.25,2.33,0,.02,0,.03.01.05.01.06.03.11.04.17.02.07.04.13.07.2.02.05.04.09.07.14.03.06.07.13.11.19.03.04.06.08.09.12.04.06.09.11.14.17.04.04.07.07.11.11.05.05.11.09.17.13.04.03.08.06.12.09.07.04.14.08.21.11.04.02.07.04.11.05.22.09.46.13.71.13h0c.25,0,.49-.05.71-.13.04-.02.08-.04.12-.05.07-.03.14-.07.21-.11.04-.03.09-.06.13-.09.06-.04.11-.08.17-.13.04-.04.08-.07.11-.11.05-.05.1-.11.14-.16.03-.04.06-.08.09-.12.04-.06.07-.12.11-.19.02-.05.05-.09.07-.14.03-.06.05-.13.07-.19.02-.06.03-.11.04-.17,0-.02.01-.03.01-.05.34-1.94,1.92-2.28,2.25-2.33.02,0,.03,0,.05-.01.07-.01.14-.03.21-.05.06-.01.11-.03.17-.05Z"
				/>
				<line style="fill: none; stroke: #010101; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.8px;" x1="81.53" y1="14.2" x2="81.53" y2="2.55" />
				<path
					style="fill: #010101;"
					d="M97.6,47.91c0,2.07-1.68,3.75-3.75,3.75s-3.75-1.68-3.75-3.75,1.68-3.75,3.75-3.75,3.75,1.68,3.75,3.75Z"
				/>
				<circle style="fill: #fff;" cx="57.12" cy="26.22" r="2.33" />
			</svg>
		{/if}

		{#if siteName}
			<span class="font-semibold text-lg tracking-tight">{siteName}</span>
		{/if}
	</a>

	<!-- Desktop Navigation - hidden on mobile -->
	<div class="hidden md:flex gap-6 items-center">
		{#each visibleLinks as link}
			{#if link.children}
				<!-- Dropdown link -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						data-testid={link.testId}
						id={link.id}
						class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {link.class ?? ''}"
						{...buildDataAttrs(link.data)}
					>
						{#if link.icon}
							{@const Icon = link.icon}
							<Icon class="h-4 w-4" />
						{/if}
						{#if link.label}{link.label}{/if}
						<ChevronDown class="h-3 w-3" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						{#each link.children as child}
							{#if child.separator}
								<DropdownMenu.Separator />
							{/if}
							<DropdownMenu.Item>
								{#if child.action}
									<form action={child.action} method={child.method ?? 'POST'} use:enhance class="w-full">
										<button
											type="submit"
											data-testid={child.testId}
											id={child.id}
											class="flex items-center gap-2 cursor-pointer w-full text-left {child.class ?? ''}"
											{...buildDataAttrs(child.data)}
										>
											{#if child.icon}
												{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
											{/if}
											{child.label}
										</button>
									</form>
								{:else}
									<a
										href={child.href ?? '#'}
										data-testid={child.testId}
										id={child.id}
										class="flex items-center gap-2 w-full cursor-pointer {child.class ?? ''}"
										{...buildDataAttrs(child.data)}
									>
										{#if child.icon}
											{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
										{/if}
										{child.label}
									</a>
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<!-- Regular link -->
				<a
					href={link.href ?? '#'}
					data-testid={link.testId}
					id={link.id}
					class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
					{...buildDataAttrs(link.data)}
				>
					{#if link.icon}
						{@const Icon = link.icon}
								<Icon class={getIconSizeClass(link.iconSize)} />
					{/if}
					{#if link.label}{link.label}{/if}
				</a>
			{/if}
		{/each}

		<!-- Avatar (shown when logged in) -->
		{#if showAvatar}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					data-testid="nav-avatar"
					class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs cursor-pointer hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden"
					aria-label="User menu"
				>
					{#if userAvatarUrl}
						<img src={userAvatarUrl} alt="User avatar" class="w-full h-full object-cover" />
					{:else}
						{avatarLetter}
					{/if}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content data-testid="nav-user-menu" class="w-48">
					{#each avatarLinks as link}
						{#if link.separator}
							<DropdownMenu.Separator />
						{/if}
						<DropdownMenu.Item>
							{#if link.action}
								<form action={link.action} method={link.method ?? 'POST'} use:enhance class="w-full">
									<button
										type="submit"
										data-testid={link.testId}
										id={link.id}
										class="flex items-center gap-2 cursor-pointer w-full text-left {link.class ?? ''}"
										{...buildDataAttrs(link.data)}
									>
										{#if link.icon}
											{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
										{/if}
										{#if link.label}{link.label}{/if}
									</button>
								</form>
							{:else}
								<a
									href={link.href ?? '#'}
									data-testid={link.testId}
									id={link.id}
									class="flex items-center gap-2 cursor-pointer w-full {link.class ?? ''}"
									{...buildDataAttrs(link.data)}
								>
									{#if link.icon}
										{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
									{/if}
									{#if link.label}{link.label}{/if}
								</a>
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}

		<!-- Theme Toggle -->
		{#if showThemeToggle}
			<ThemeToggle.Root mode={themeToggleMode} />
		{/if}
	</div>

	<!-- Mobile Hamburger - hidden on desktop -->
	<Button.Root
		variant="ghost"
		size="icon"
		class="md:hidden"
		data-testid="nav-mobile-toggle"
		onclick={() => (mobileMenuOpen = true)}
		aria-label="Open navigation menu"
	>
		<Menu class="h-6 w-6" />
	</Button.Root>
	</div>

	<!-- Mobile Sheet -->
	<Sheet.Root bind:open={mobileMenuOpen}>
		<Sheet.Content side="left" data-testid="nav-mobile-drawer">
			<Sheet.Header>
				{#if siteName}
					<Sheet.Title>{siteName}</Sheet.Title>
				{/if}
			</Sheet.Header>
			<div class="flex flex-col gap-4 mt-6 px-4">
				{#each visibleLinks as link}
					{#if link.children}
						<!-- Expandable section for dropdowns -->
						<div>
							<button
								class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 w-full {link.class ?? ''}"
								data-testid={link.testId}
								id={link.id}
								onclick={() => toggleDropdown(getDropdownKey(link))}
								{...buildDataAttrs(link.data)}
							>
								{#if link.icon}
									{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
								{/if}
								{#if link.label}{link.label}{/if}
								<ChevronDown class="h-3 w-3 transition-transform {expandedDropdowns[getDropdownKey(link)] ? 'rotate-180' : ''}" />
							</button>
							{#if expandedDropdowns[getDropdownKey(link)]}
								<div class="ml-4 mt-2 flex flex-col gap-2">
									{#each link.children as child}
										{#if child.action}
											<form action={child.action} method={child.method ?? 'POST'} use:enhance class="w-full">
												<button
													type="submit"
													data-testid={child.testId}
													id={child.id}
													class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
													{...buildDataAttrs(child.data)}
												>
													{#if child.icon}
														{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
													{/if}
													{child.label}
												</button>
											</form>
										{:else}
											<a
												href={child.href ?? '#'}
												data-testid={child.testId}
												id={child.id}
												class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {child.class ?? ''}"
												onclick={() => (mobileMenuOpen = false)}
												{...buildDataAttrs(child.data)}
											>
												{#if child.icon}
													{@const ChildIcon = child.icon}
												<ChildIcon class="h-4 w-4" />
												{/if}
												{child.label}
											</a>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<!-- Regular link -->
						<a
							href={link.href ?? '#'}
							data-testid={link.testId}
							id={link.id}
							class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 {isActive(link.href) ? 'font-semibold' : ''} {link.class ?? ''}"
							onclick={() => (mobileMenuOpen = false)}
							{...buildDataAttrs(link.data)}
						>
							{#if link.icon}
								{@const Icon = link.icon}
								<Icon class={getIconSizeClass(link.iconSize)} />
							{/if}
							{#if link.label}{link.label}{/if}
						</a>
					{/if}
				{/each}

				<!-- Avatar Menu in mobile drawer -->
				{#if showAvatar}
					<div class="pt-4 border-t border-border">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
								{#if userAvatarUrl}
									<img src={userAvatarUrl} alt="User avatar" class="w-full h-full object-cover" />
								{:else}
									{avatarLetter}
								{/if}
							</div>
							<span class="text-sm text-muted-foreground">{userEmail}</span>
						</div>
						<div class="flex flex-col gap-2">
							{#each avatarLinks as link}
								{#if link.action}
									<form action={link.action} method={link.method ?? 'POST'} use:enhance class="w-full">
										<button
											type="submit"
											data-testid={link.testId}
											id={link.id}
											class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 w-full {link.class ?? ''}"
											{...buildDataAttrs(link.data)}
										>
											{#if link.icon}
												{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
											{/if}
											{#if link.label}{link.label}{/if}
										</button>
									</form>
								{:else}
									<a
										href={link.href ?? '#'}
										data-testid={link.testId}
										id={link.id}
										class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-2 {link.class ?? ''}"
										onclick={() => (mobileMenuOpen = false)}
										{...buildDataAttrs(link.data)}
									>
										{#if link.icon}
											{@const Icon = link.icon}
								<Icon class="h-4 w-4" />
										{/if}
										{#if link.label}{link.label}{/if}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- Theme Toggle in mobile drawer -->
				{#if showThemeToggle}
					<div class="pt-4 border-t border-border flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Theme</span>
						<ThemeToggle.Root mode={themeToggleMode} />
					</div>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</nav>
