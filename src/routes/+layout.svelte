<script lang="ts">
	import '../app.css';
	import { Nav, Footer } from '$lib/components/blocks';
	import type { NavLink, AvatarConfig } from '$lib/components/blocks';
	import { User, Settings, LogOut, Github } from 'lucide-svelte';

	let { children, data } = $props();

	const navLinks: NavLink[] = [
		{ href: '/getting-started', label: 'Getting Started' },
		{ href: '/docs', label: 'Docs' },
		{ href: '/subscribe', label: 'Subscribe' },
		{ href: '/login', label: 'Log In', hideWhenAuth: true, testId: 'nav-login' },
		{ href: '/signup', label: 'Sign Up', hideWhenAuth: true, testId: 'nav-signup' },
		{ href: 'https://github.com/mark-mcdermott/themeforseen.com', icon: Github, iconSize: 'lg', testId: 'nav-github' }
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
		avatar={avatarConfig}
	/>

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer siteName="themeforseen.com" maxWidth="max-w-6xl" />
</div>
