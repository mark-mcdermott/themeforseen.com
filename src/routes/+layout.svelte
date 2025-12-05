<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Nav, Footer } from '$lib/components/blocks';
	import type { NavLink, AvatarConfig } from '$lib/components/blocks';
	import { User, Users, Settings, LogOut, Github, Heart, Palette, Monitor, FileCode, Wand2, Eye, Glasses, Type, FlaskConical, BookType } from 'lucide-svelte';

	onMount(async () => {
		await import('theme-forseen');
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let { children, data } = $props();

	const navLinks: NavLink[] = [
		{ href: '/getting-started', label: 'Getting Started' },
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/admin/users', label: 'Users', icon: Users, requiresAdmin: true, testId: 'nav-admin-users' },
		{ href: '/login', label: 'Log In', hideWhenAuth: true, testId: 'nav-login' },
		{ href: '/signup', label: 'Sign Up', hideWhenAuth: true, testId: 'nav-signup' },
		{ href: 'https://github.com/mark-mcdermott/theme-forseen', icon: Github, iconSize: 'lg', testId: 'nav-github' }
	];

	const profileUrl = $derived(data.user?.id ? `/u/${data.user.id}` : '#');

	const avatarConfig = $derived<AvatarConfig>({
		show: true,
		links: [
			{
				label: 'Profile',
				href: profileUrl,
				icon: User,
				testId: 'menu-profile'
			},
			...(data.user?.isPremium
				? [
						{
							label: 'Favorites',
							href: '/favorites',
							icon: Heart,
							testId: 'menu-favorites'
						},
						{
							label: 'Custom Palettes',
							href: '/palettes',
							icon: Palette,
							testId: 'menu-palettes'
						},
						{
							label: 'Custom Fonts',
							href: '/fonts',
							icon: Type,
							testId: 'menu-fonts'
						},
						{
							label: 'Font Explorer',
							href: '/font-explorer',
							icon: BookType,
							testId: 'menu-font-explorer'
						},
						{
							label: 'Site Previewer',
							href: '/previewer',
							icon: Monitor,
							testId: 'menu-previewer'
						},
						{
							label: 'Export Theme',
							href: '/export',
							icon: FileCode,
							testId: 'menu-export'
						},
						{
							label: 'Extract Colors',
							href: '/extract',
							icon: Wand2,
							testId: 'menu-extract'
						},
						{
							label: 'Accessibility',
							href: '/accessibility',
							icon: Eye,
							testId: 'menu-accessibility'
						},
						{
							label: 'Color Blindness',
							href: '/colorblind',
							icon: Glasses,
							testId: 'menu-colorblind'
						},
						{
							label: 'A/B Testing',
							href: '/ab-testing',
							icon: FlaskConical,
							testId: 'menu-ab-testing'
						}
					]
				: []),
			{
				label: 'Settings',
				href: '/account',
				icon: Settings,
				testId: 'menu-settings'
			},
			{
				label: 'Sign Out',
				icon: LogOut,
				action: '/logout',
				testId: 'menu-signout',
				separator: true
			}
		]
	});
</script>

<div class="min-h-dvh flex flex-col">
	<Nav
		siteName="themeforseen.com"
		links={navLinks}
		maxWidth="max-w-6xl"
		user={data.user}
		isAdmin={data.user?.isAdmin ?? false}
		avatar={avatarConfig}
		showThemeToggle={true}
	/>

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
